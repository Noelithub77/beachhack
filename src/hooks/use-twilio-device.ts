"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Device, Call } from "@twilio/voice-sdk";

type DeviceState = "offline" | "registering" | "ready" | "busy" | "error";

interface TwilioDeviceOptions {
    identity: string;
    onIncomingCall?: (call: Call) => void;
    onCallDisconnect?: () => void;
    onError?: (error: Error) => void;
}

interface TwilioDeviceReturn {
    state: DeviceState;
    error: string | null;
    activeCall: Call | null;
    incomingCall: Call | null;
    register: () => Promise<void>;
    unregister: () => void;
    makeCall: (to: string) => Promise<Call | null>;
    acceptCall: () => void;
    rejectCall: () => void;
    hangUp: () => void;
    mute: (muted: boolean) => void;
    isMuted: boolean;
}

export function useTwilioDevice(options: TwilioDeviceOptions): TwilioDeviceReturn {
    const { identity, onIncomingCall, onCallDisconnect, onError } = options;

    const [state, setState] = useState<DeviceState>("offline");
    const [error, setError] = useState<string | null>(null);
    const [activeCall, setActiveCall] = useState<Call | null>(null);
    const [incomingCall, setIncomingCall] = useState<Call | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const deviceRef = useRef<Device | null>(null);

    // fetch token and register device
    const register = useCallback(async () => {
        if (!identity) return;

        setState("registering");
        setError(null);

        try {
            const res = await fetch("/api/voice/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identity }),
            });

            if (!res.ok) throw new Error("Failed to get token");

            const { token } = await res.json();

            // destroy existing device
            if (deviceRef.current) {
                deviceRef.current.destroy();
            }

            // create new device
            const device = new Device(token, {
                codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
                allowIncomingWhileBusy: false,
            });

            device.on("registered", () => {
                setState("ready");
            });

            device.on("error", (err) => {
                setError(err.message);
                setState("error");
                onError?.(err);
            });

            device.on("incoming", (call) => {
                setIncomingCall(call);
                onIncomingCall?.(call);

                call.on("cancel", () => {
                    setIncomingCall(null);
                });

                call.on("disconnect", () => {
                    setIncomingCall(null);
                    setActiveCall(null);
                    setState("ready");
                    onCallDisconnect?.();
                });
            });

            device.on("unregistered", () => {
                setState("offline");
            });

            await device.register();
            deviceRef.current = device;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
            setState("error");
        }
    }, [identity, onIncomingCall, onCallDisconnect, onError]);

    // unregister device
    const unregister = useCallback(() => {
        if (deviceRef.current) {
            deviceRef.current.unregister();
            deviceRef.current.destroy();
            deviceRef.current = null;
        }
        setState("offline");
    }, []);

    // make outgoing call
    const makeCall = useCallback(async (to: string): Promise<Call | null> => {
        if (!deviceRef.current || state !== "ready") return null;

        try {
            setState("busy");
            const call = await deviceRef.current.connect({
                params: { To: to },
            });

            call.on("accept", () => {
                setActiveCall(call);
            });

            call.on("disconnect", () => {
                setActiveCall(null);
                setState("ready");
                onCallDisconnect?.();
            });

            call.on("error", (err) => {
                setError(err.message);
                setActiveCall(null);
                setState("ready");
            });

            setActiveCall(call);
            return call;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Call failed");
            setState("ready");
            return null;
        }
    }, [state, onCallDisconnect]);

    // accept incoming call
    const acceptCall = useCallback(() => {
        if (!incomingCall) return;

        incomingCall.accept();
        setActiveCall(incomingCall);
        setIncomingCall(null);
        setState("busy");

        incomingCall.on("disconnect", () => {
            setActiveCall(null);
            setState("ready");
            onCallDisconnect?.();
        });
    }, [incomingCall, onCallDisconnect]);

    // reject incoming call
    const rejectCall = useCallback(() => {
        if (!incomingCall) return;
        incomingCall.reject();
        setIncomingCall(null);
    }, [incomingCall]);

    // hang up active call
    const hangUp = useCallback(() => {
        if (activeCall) {
            activeCall.disconnect();
            setActiveCall(null);
            setState("ready");
        }
    }, [activeCall]);

    // mute/unmute
    const mute = useCallback((muted: boolean) => {
        if (activeCall) {
            activeCall.mute(muted);
            setIsMuted(muted);
        }
    }, [activeCall]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (deviceRef.current) {
                deviceRef.current.destroy();
            }
        };
    }, []);

    return {
        state,
        error,
        activeCall,
        incomingCall,
        register,
        unregister,
        makeCall,
        acceptCall,
        rejectCall,
        hangUp,
        mute,
        isMuted,
    };
}
