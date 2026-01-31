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
        if (!text || text.trim() === "") return;
        const message: Message = {
            id: `msg-${++messageIdCounter.current}`,
            role,
            text,
            timestamp: Date.now(),
        };
        console.log("[ElevenLabs] Adding message:", message);
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
            console.log("[ElevenLabs] Raw message received:", JSON.stringify(message, null, 2));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = message as any;

            // format 1: source-based (newer SDK)
            if (msg.source === "user" && msg.message) {
                addMessage("user", msg.message);
                return;
            }
            if (msg.source === "ai" && msg.message) {
                addMessage("agent", msg.message);
                return;
            }

            // format 2: type-based events
            if (msg.type === "user_transcript" && msg.user_transcript) {
                addMessage("user", msg.user_transcript);
                return;
            }
            if (msg.type === "agent_response" && msg.agent_response) {
                addMessage("agent", msg.agent_response);
                return;
            }

            // format 3: transcript event with message field
            if (msg.type === "transcript" && msg.role === "user" && msg.isFinal && msg.message) {
                addMessage("user", msg.message);
                return;
            }
            if (msg.type === "agent_response" && msg.message) {
                addMessage("agent", msg.message);
                return;
            }

            // format 4: direct role/text structure
            if (msg.role === "user" && msg.text) {
                addMessage("user", msg.text);
                return;
            }
            if ((msg.role === "agent" || msg.role === "assistant") && msg.text) {
                addMessage("agent", msg.text);
                return;
            }

            // format 5: message with content field
            if (msg.role === "user" && msg.content) {
                addMessage("user", msg.content);
                return;
            }
            if ((msg.role === "agent" || msg.role === "assistant") && msg.content) {
                addMessage("agent", msg.content);
                return;
            }
        },
        onModeChange: (data) => {
            const mode = data.mode as AgentMode;
            console.log("[ElevenLabs] Mode changed:", mode);
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
            console.log("[ElevenLabs] Token received, starting session...");

            // start session with WebRTC
            const convId = await conversation.startSession({
                conversationToken: tokenData.token,
                dynamicVariables: {
                    vendor_name: tokenData.context.vendorName,
                    vendor_context: tokenData.context.vendorContext,
                    user_name: tokenData.context.userName,
                    user_id: tokenData.context.userId,
                },
            });

            console.log("[ElevenLabs] Session started, conversation ID:", convId);
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
