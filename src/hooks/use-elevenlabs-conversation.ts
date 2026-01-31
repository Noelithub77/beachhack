"use client";

import { useCallback, useState, useRef } from "react";
import { useConversation } from "@elevenlabs/react";

export type ConversationStatus = "idle" | "connecting" | "connected" | "disconnected";
export type AgentMode = "listening" | "speaking";

interface Message {
    id: string;
    role: "user" | "agent";
    text: string;
    timestamp: number;
}

interface ConversationContext {
    vendorName?: string;
    vendorContext?: string;
    userName?: string;
    userId?: string;
}

interface UseElevenLabsConversationOptions {
    onMessage?: (message: Message) => void;
    onStatusChange?: (status: ConversationStatus) => void;
    onModeChange?: (mode: AgentMode) => void;
    onError?: (error: string) => void;
}

export function useElevenLabsConversation(options: UseElevenLabsConversationOptions = {}) {
    const { onMessage, onStatusChange, onModeChange, onError } = options;

    const [status, setStatus] = useState<ConversationStatus>("idle");
    const [agentMode, setAgentMode] = useState<AgentMode>("listening");
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const messageIdCounter = useRef(0);

    const addMessage = useCallback((role: "user" | "agent", text: string) => {
        const message: Message = {
            id: `msg-${++messageIdCounter.current}`,
            role,
            text,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, message]);
        onMessage?.(message);
    }, [onMessage]);

    const conversation = useConversation({
        onConnect: () => {
            console.log("[ElevenLabs] Connected");
            setStatus("connected");
            setError(null);
            onStatusChange?.("connected");
        },
        onDisconnect: () => {
            console.log("[ElevenLabs] Disconnected");
            setStatus("disconnected");
            onStatusChange?.("disconnected");
        },
        onMessage: (message) => {
            console.log("[ElevenLabs] Message:", message);
            // cast to access properties - ElevenLabs types are generic
            const msg = message as { type?: string; role?: string; isFinal?: boolean; message?: string };
            // handle transcript messages
            if (msg.type === "transcript" && msg.role === "user" && msg.isFinal && msg.message) {
                addMessage("user", msg.message);
            } else if (msg.type === "agent_response" && msg.message) {
                addMessage("agent", msg.message);
            }
        },
        onModeChange: (data) => {
            const mode = data.mode as AgentMode;
            console.log("[ElevenLabs] Mode:", mode);
            setAgentMode(mode);
            onModeChange?.(mode);
        },
        onError: (err) => {
            console.error("[ElevenLabs] Error:", err);
            const errorMsg = err.message || "Connection error";
            setError(errorMsg);
            onError?.(errorMsg);
        },
    });

    // start conversation with context
    const startConversation = useCallback(async (context: ConversationContext = {}) => {
        try {
            setStatus("connecting");
            setError(null);
            setMessages([]);
            onStatusChange?.("connecting");

            // request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // get conversation token from our API
            const tokenRes = await fetch("/api/elevenlabs/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(context),
            });

            if (!tokenRes.ok) {
                throw new Error("Failed to get conversation token");
            }

            const tokenData = await tokenRes.json();

            // start session with WebRTC
            const convId = await conversation.startSession({
                conversationToken: tokenData.token,
                connectionType: "webrtc",
                dynamicVariables: {
                    vendor_name: tokenData.context.vendorName,
                    vendor_context: tokenData.context.vendorContext,
                    user_name: tokenData.context.userName,
                    user_id: tokenData.context.userId,
                },
            });

            setConversationId(convId);
            return convId;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to start conversation";
            console.error("[ElevenLabs] Start error:", err);
            setError(errorMsg);
            setStatus("idle");
            onError?.(errorMsg);
            onStatusChange?.("idle");
            return null;
        }
    }, [conversation, onStatusChange, onError]);

    // end conversation
    const endConversation = useCallback(async () => {
        try {
            await conversation.endSession();
            setStatus("idle");
            setConversationId(null);
            onStatusChange?.("idle");
        } catch (err) {
            console.error("[ElevenLabs] End error:", err);
        }
    }, [conversation, onStatusChange]);

    // toggle mute
    const toggleMute = useCallback(() => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        // ElevenLabs handles audio internally via the conversation object
        if (newMuted) {
            conversation.setVolume({ volume: 0 });
        } else {
            conversation.setVolume({ volume: 1 });
        }
    }, [isMuted, conversation]);

    // set volume (0-1)
    const setVolume = useCallback((volume: number) => {
        conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
    }, [conversation]);

    return {
        // state
        status,
        agentMode,
        messages,
        error,
        conversationId,
        isMuted,
        isConnected: status === "connected",
        isConnecting: status === "connecting",

        // actions
        startConversation,
        endConversation,
        toggleMute,
        setVolume,
    };
}
