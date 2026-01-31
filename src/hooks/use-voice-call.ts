"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { useCallStore } from "@/stores/call-store";

interface UseVoiceCallOptions {
    identity: string;
    onIncomingCall?: (from: string) => void;
    onCallEnd?: () => void;
}

type DeviceState = "idle" | "requesting_permission" | "initializing" | "ready" | "error";

export function useVoiceCall({ identity, onIncomingCall, onCallEnd }: UseVoiceCallOptions) {
    const [deviceState, setDeviceState] = useState<DeviceState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    const deviceRef = useRef<Device | null>(null);
    const callRef = useRef<Call | null>(null);
    const tokenRef = useRef<string | null>(null);

    const { startCall, endCall, toggleMute, toggleSpeaker, isMuted, isSpeakerOn } = useCallStore();

    // step 1: request microphone permission (call this first on user click)
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (permissionGranted) return true;

        setDeviceState("requesting_permission");
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            // keep stream alive briefly to ensure permission is cached
            await new Promise((r) => setTimeout(r, 100));
            stream.getTracks().forEach((t) => t.stop());

            setPermissionGranted(true);
            setDeviceState("idle");
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Microphone access denied";
            setError(msg);
            setDeviceState("error");
            return false;
        }
    }, [permissionGranted]);

    // step 2: fetch token from server
    const fetchToken = useCallback(async (): Promise<string | null> => {
        try {
            const res = await fetch("/api/voice/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identity }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to fetch token");
            }

            const { token } = await res.json();
            if (!token) throw new Error("Missing token in response");

            tokenRef.current = token;
            return token;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Token fetch failed";
            setError(msg);
            return null;
        }
    }, [identity]);

    // step 3: initialize device (must be called after user interaction)
    const initializeDevice = useCallback(async (): Promise<boolean> => {
        // already ready
        if (deviceRef.current && deviceState === "ready") return true;

        // need permission first
        if (!permissionGranted) {
            const granted = await requestPermission();
            if (!granted) return false;
        }

        setDeviceState("initializing");
        setError(null);

        // cleanup existing device
        if (deviceRef.current) {
            deviceRef.current.destroy();
            deviceRef.current = null;
        }

        // get token
        const token = await fetchToken();
        if (!token) {
            setDeviceState("error");
            return false;
        }

        return new Promise((resolve) => {
            try {
                const device = new Device(token, {
                    logLevel: 1,
                    codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
                    allowIncomingWhileBusy: false,
                });

                const timeout = setTimeout(() => {
                    setError("Device registration timeout");
                    setDeviceState("error");
                    device.destroy();
                    resolve(false);
                }, 15000);

                device.on("registered", () => {
                    clearTimeout(timeout);
                    console.log("[Twilio] Device registered:", device.identity);
                    deviceRef.current = device;
                    setDeviceState("ready");
                    resolve(true);
                });

                device.on("error", (err) => {
                    clearTimeout(timeout);
                    console.error("[Twilio] Device error:", err.code, err.message);
                    setError(`Device error: ${err.message}`);
                    setDeviceState("error");
                    resolve(false);
                });

                device.on("unregistered", () => {
                    console.log("[Twilio] Device unregistered");
                    setDeviceState("idle");
                });

                device.on("incoming", (call) => {
                    console.log("[Twilio] Incoming call:", call.parameters.From);
                    callRef.current = call;
                    onIncomingCall?.(call.parameters.From || "Unknown");
                });

                device.register();
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Device init failed";
                setError(msg);
                setDeviceState("error");
                resolve(false);
            }
        });
    }, [deviceState, permissionGranted, requestPermission, fetchToken, onIncomingCall]);

    // make outgoing call
    const makeCall = useCallback(async (to: string, sessionId: string, remoteName: string): Promise<boolean> => {
        // ensure device ready
        if (deviceState !== "ready") {
            const ready = await initializeDevice();
            if (!ready) return false;
        }

        if (!deviceRef.current) {
            setError("Device not available");
            return false;
        }

        setError(null);

        try {
            console.log("[Twilio] Connecting call to:", to);

            const call = await deviceRef.current.connect({
                params: { To: to },
                rtcConstraints: {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                },
            });

            callRef.current = call;

            return new Promise((resolve) => {
                let resolved = false;
                const resolveOnce = (v: boolean) => {
                    if (resolved) return;
                    resolved = true;
                    resolve(v);
                };

                const callTimeout = setTimeout(() => {
                    console.warn("[Twilio] Call connection timeout");
                    call.disconnect();
                    resolveOnce(false);
                }, 30000);

                call.on("ringing", (hasEarlyMedia) => {
                    console.log("[Twilio] Ringing, early media:", hasEarlyMedia);
                });

                call.on("accept", () => {
                    clearTimeout(callTimeout);
                    console.log("[Twilio] Call accepted, codec:", call.codec);
                    startCall(sessionId, to, remoteName);
                    resolveOnce(true);
                });

                call.on("disconnect", () => {
                    clearTimeout(callTimeout);
                    console.log("[Twilio] Call disconnected");
                    callRef.current = null;
                    endCall();
                    onCallEnd?.();
                    resolveOnce(false);
                });

                call.on("cancel", () => {
                    clearTimeout(callTimeout);
                    console.log("[Twilio] Call cancelled");
                    callRef.current = null;
                    endCall();
                    resolveOnce(false);
                });

                call.on("error", (err) => {
                    clearTimeout(callTimeout);
                    console.error("[Twilio] Call error:", err.code, err.message);
                    setError(err.message);
                    callRef.current = null;
                    endCall();
                    resolveOnce(false);
                });

                call.on("warning", (name) => {
                    console.warn("[Twilio] Call warning:", name);
                });
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Call failed";
            console.error("[Twilio] Connect error:", err);
            setError(msg);
            return false;
        }
    }, [deviceState, initializeDevice, startCall, endCall, onCallEnd]);

    // answer incoming call
    const answerCall = useCallback((sessionId: string, remoteName: string) => {
        const call = callRef.current;
        if (!call) return;

        call.accept({
            rtcConstraints: {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            },
        });

        startCall(sessionId, call.parameters.From || "unknown", remoteName);

        call.on("disconnect", () => {
            callRef.current = null;
            endCall();
            onCallEnd?.();
        });
    }, [startCall, endCall, onCallEnd]);

    // hang up
    const hangUp = useCallback(() => {
        if (callRef.current) {
            callRef.current.disconnect();
            callRef.current = null;
        }
        endCall();
    }, [endCall]);

    // mute
    const setMuted = useCallback((muted: boolean) => {
        if (callRef.current) {
            callRef.current.mute(muted);
        }
        toggleMute();
    }, [toggleMute]);

    // cleanup
    useEffect(() => {
        return () => {
            if (callRef.current) {
                callRef.current.disconnect();
                callRef.current = null;
            }
            if (deviceRef.current) {
                deviceRef.current.destroy();
                deviceRef.current = null;
            }
        };
    }, []);

    return {
        // states
        deviceState,
        isReady: deviceState === "ready",
        isInitializing: deviceState === "initializing" || deviceState === "requesting_permission",
        permissionGranted,
        error,

        // actions
        requestPermission,
        initializeDevice,
        makeCall,
        answerCall,
        hangUp,
        setMuted,
        toggleSpeaker,

        // call state
        isMuted,
        isSpeakerOn,
    };
}
