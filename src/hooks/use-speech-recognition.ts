"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SpeechRecognitionInstance } from "@/types/speech";

interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    onTranscript?: (text: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
}

interface SpeechRecognitionReturn {
    isSupported: boolean;
    isListening: boolean;
    transcript: string;
    start: () => void;
    stop: () => void;
    reset: () => void;
}

export function useSpeechRecognition(
    options: SpeechRecognitionOptions = {}
): SpeechRecognitionReturn {
    const {
        continuous = true,
        interimResults = true,
        lang = "en-US",
        onTranscript,
        onError,
    } = options;

    const [isSupported, setIsSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const isListeningRef = useRef(false);

    // check support on mount
    useEffect(() => {
        const SpeechRecognitionAPI =
            typeof window !== "undefined"
                ? window.SpeechRecognition || window.webkitSpeechRecognition
                : null;

        setIsSupported(!!SpeechRecognitionAPI);

        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = continuous;
            recognition.interimResults = interimResults;
            recognition.lang = lang;

            recognition.onresult = (event) => {
                let finalTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                        onTranscript?.(result[0].transcript, true);
                    } else {
                        onTranscript?.(result[0].transcript, false);
                    }
                }

                if (finalTranscript) {
                    setTranscript((prev) => prev + " " + finalTranscript);
                }
            };

            recognition.onerror = (event) => {
                if (event.error !== "no-speech") {
                    onError?.(event.error);
                }
            };

            recognition.onend = () => {
                // restart if still supposed to be listening
                if (isListeningRef.current) {
                    try {
                        recognition.start();
                    } catch {
                        // ignore
                    }
                }
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [continuous, interimResults, lang, onTranscript, onError]);

    const start = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                isListeningRef.current = true;
            } catch {
                // may already be running
            }
        }
    }, [isListening]);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            isListeningRef.current = false;
        }
    }, []);

    const reset = useCallback(() => {
        setTranscript("");
    }, []);

    return {
        isSupported,
        isListening,
        transcript,
        start,
        stop,
        reset,
    };
}
