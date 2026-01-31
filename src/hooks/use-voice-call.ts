"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { useCallStore } from "@/stores/call-store";

interface UseVoiceCallOptions {
    identity: string;
    onIncomingCall?: (from: string) => void;
    onCallEnd?: () => void;
}

export function useVoiceCall({ identity, onIncomingCall, onCallEnd }: UseVoiceCallOptions) {
    const [device, setDevice] = useState<Device | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const callRef = useRef<Call | null>(null);

    const { startCall, endCall, toggleMute, toggleSpeaker, isMuted, isSpeakerOn } = useCallStore();

    // initialize Twilio device
    const initialize = useCallback(async () => {
        try {
            const res = await fetch("/api/voice/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identity }),
            });
            const { token } = await res.json();

            const newDevice = new Device(token, {
                logLevel: 1,
                codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
            });

            newDevice.on("registered", () => setIsReady(true));
            newDevice.on("error", (err) => setError(err.message));
            newDevice.on("incoming", (call) => {
                callRef.current = call;
                onIncomingCall?.(call.parameters.From || "Unknown");
            });

            await newDevice.register();
            setDevice(newDevice);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to initialize");
        }
    }, [identity, onIncomingCall]);

    // make outgoing call
    const makeCall = useCallback(async (to: string, sessionId: string, remoteName: string) => {
        if (!device || !isReady) return;

        try {
            const call = await device.connect({ params: { To: to } });
            callRef.current = call;
            startCall(sessionId, to, remoteName);

            call.on("disconnect", () => {
                callRef.current = null;
                endCall();
                onCallEnd?.();
            });

            call.on("cancel", () => {
                callRef.current = null;
                endCall();
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Call failed");
        }
    }, [device, isReady, startCall, endCall, onCallEnd]);

    // answer incoming call
    const answerCall = useCallback((sessionId: string, remoteName: string) => {
        if (!callRef.current) return;

        callRef.current.accept();
        startCall(sessionId, callRef.current.parameters.From || "unknown", remoteName);

        callRef.current.on("disconnect", () => {
            callRef.current = null;
            endCall();
            onCallEnd?.();
        });
    }, [startCall, endCall, onCallEnd]);

    // hang up call
    const hangUp = useCallback(() => {
        callRef.current?.disconnect();
        callRef.current = null;
        endCall();
    }, [endCall]);

    // toggle mute
    const setMuted = useCallback((muted: boolean) => {
        if (callRef.current) {
            callRef.current.mute(muted);
        }
        toggleMute();
    }, [toggleMute]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            device?.destroy();
        };
    }, [device]);

    return {
        initialize,
        makeCall,
        answerCall,
        hangUp,
        setMuted,
        toggleSpeaker,
        isReady,
        isMuted,
        isSpeakerOn,
        error,
    };
}
