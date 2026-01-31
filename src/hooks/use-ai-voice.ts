"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SpeechRecognitionInstance } from "@/types/speech";

interface UseAIVoiceOptions {
    onTranscript?: (text: string, isFinal: boolean) => void;
    onAIResponse?: (text: string) => void;
    onError?: (error: string) => void;
}

type AIVoiceState = "idle" | "requesting_permission" | "listening" | "processing" | "speaking" | "error";

// check if speech recognition available
const getSpeechRecognition = () => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export function useAIVoice({ onTranscript, onAIResponse, onError }: UseAIVoiceOptions = {}) {
    const [state, setState] = useState<AIVoiceState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const shouldRestartRef = useRef(false);

    // check support on mount
    useEffect(() => {
        setIsSupported(getSpeechRecognition() !== null);
    }, []);

    // request mic permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (permissionGranted) return true;

        setState("requesting_permission");
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            streamRef.current = stream;
            setPermissionGranted(true);
            setState("idle");
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Microphone access denied";
            setError(msg);
            setState("error");
            onError?.(msg);
            return false;
        }
    }, [permissionGranted, onError]);

    // start speech recognition
    const startListening = useCallback(async (): Promise<boolean> => {
        const SpeechRecognitionClass = getSpeechRecognition();
        
        if (!SpeechRecognitionClass) {
            const msg = "Speech recognition not supported in this browser. Try Chrome or Edge.";
            setError(msg);
            setState("error");
            onError?.(msg);
            return false;
        }

        // ensure permission
        if (!permissionGranted) {
            const granted = await requestPermission();
            if (!granted) return false;
        }

        // stop existing
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // ignore
            }
        }

        try {
            const recognition = new SpeechRecognitionClass();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                console.log("[AI Voice] Recognition started");
                setIsListening(true);
                setState("listening");
            };

            recognition.onresult = (event) => {
                const results = event.results;
                const latest = results[results.length - 1];
                const transcript = latest[0].transcript;
                const isFinal = latest.isFinal;

                console.log("[AI Voice] Transcript:", transcript, "Final:", isFinal);
                onTranscript?.(transcript, isFinal);
            };

            recognition.onerror = (event) => {
                console.error("[AI Voice] Recognition error:", event.error);
                // ignore no-speech errors (normal during pauses)
                if (event.error !== "no-speech") {
                    setError(event.error);
                    onError?.(event.error);
                }
            };

            recognition.onend = () => {
                console.log("[AI Voice] Recognition ended");
                setIsListening(false);
                // auto-restart if we should keep listening
                if (shouldRestartRef.current && recognitionRef.current === recognition) {
                    try {
                        setTimeout(() => {
                            if (shouldRestartRef.current && recognitionRef.current) {
                                recognitionRef.current.start();
                                setIsListening(true);
                            }
                        }, 100);
                    } catch {
                        setState("idle");
                    }
                }
            };

            recognitionRef.current = recognition;
            shouldRestartRef.current = true;
            recognition.start();
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to start recognition";
            setError(msg);
            setState("error");
            onError?.(msg);
            return false;
        }
    }, [permissionGranted, requestPermission, state, onTranscript, onError]);

    // stop speech recognition
    const stopListening = useCallback(() => {
        shouldRestartRef.current = false;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // ignore
            }
            recognitionRef.current = null;
        }
        setIsListening(false);
        setState("idle");
    }, []);

    // speak text using ElevenLabs TTS
    const speak = useCallback(async (text: string): Promise<boolean> => {
        if (!text.trim()) return true;

        setState("speaking");
        setIsSpeaking(true);

        // temporarily pause auto-restart
        const wasListening = shouldRestartRef.current;
        shouldRestartRef.current = false;

        try {
            // pause recognition while speaking
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // ignore
                }
            }

            const res = await fetch("/api/voice/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                throw new Error("TTS request failed");
            }

            const audioBlob = await res.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            return new Promise((resolve) => {
                const audio = new Audio(audioUrl);
                audioRef.current = audio;

                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    setIsSpeaking(false);
                    audioRef.current = null;
                    onAIResponse?.(text);
                    
                    // resume listening after speaking if we were listening before
                    if (wasListening && recognitionRef.current) {
                        shouldRestartRef.current = true;
                        setState("listening");
                        try {
                            recognitionRef.current.start();
                            setIsListening(true);
                        } catch {
                            // may already be started
                        }
                    } else {
                        setState("idle");
                    }
                    resolve(true);
                };

                audio.onerror = () => {
                    URL.revokeObjectURL(audioUrl);
                    setIsSpeaking(false);
                    audioRef.current = null;
                    shouldRestartRef.current = wasListening;
                    setState(wasListening ? "listening" : "idle");
                    resolve(false);
                };

                audio.play().catch((err) => {
                    console.error("[AI Voice] Audio play error:", err);
                    URL.revokeObjectURL(audioUrl);
                    setIsSpeaking(false);
                    shouldRestartRef.current = wasListening;
                    setState(wasListening ? "listening" : "idle");
                    resolve(false);
                });
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "TTS failed";
            console.error("[AI Voice] TTS error:", err);
            setError(msg);
            setIsSpeaking(false);
            shouldRestartRef.current = wasListening;
            setState(wasListening ? "listening" : "idle");
            return false;
        }
    }, [onAIResponse]);

    // stop speaking
    const stopSpeaking = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    // cleanup
    const cleanup = useCallback(() => {
        stopListening();
        stopSpeaking();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setState("idle");
    }, [stopListening, stopSpeaking]);

    // cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        state,
        error,
        permissionGranted,
        isListening,
        isSpeaking,
        isSupported,

        requestPermission,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        cleanup,
    };
}
