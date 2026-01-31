"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCallStore } from "@/stores/call-store";
import { useVoiceCall } from "@/hooks/use-voice-call";
import { CallAvatar } from "@/components/call/call-avatar";
import { CallControls } from "@/components/call/call-controls";
import { CallTimer } from "@/components/call/call-timer";
import {
  TranscriptionPanel,
  type Transcript,
} from "@/components/call/transcription-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Phone, Bot, User } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { nanoid } from "nanoid";

type CallMode = "idle" | "connecting" | "ai_call" | "human_call";

export default function CallPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isInCall, callStartTime, callSessionId } = useCallStore();
  const [mode, setMode] = useState<CallMode>("idle");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  const startCallSession = useMutation(api.functions.calls.start);
  const endCallSession = useMutation(api.functions.calls.end);

  const handleCallEnd = useCallback(() => {
    setMode("idle");
    setTranscripts([]);
  }, []);

  const {
    initialize,
    makeCall,
    hangUp,
    setMuted,
    toggleSpeaker,
    isReady,
    isMuted,
    error,
  } = useVoiceCall({
    identity: user?.id || "anonymous",
    onCallEnd: handleCallEnd,
  });

  // initialize Twilio on mount
  useEffect(() => {
    if (user) initialize();
  }, [user, initialize]);

  // start AI voice call
  const startAICall = async () => {
    if (!user) return;
    setMode("connecting");

    // create call session in database
    // using placeholder ticket ID for now
    const result = await startCallSession({
      ticketId: "placeholder" as any,
      callerId: user.id as any,
    });

    if (result.success) {
      setMode("ai_call");
      // add welcome transcript
      addTranscript(
        "ai",
        "Hello! I'm SAGE, your AI support assistant. How can I help you today?",
      );
    }
  };

  // start human rep call
  const startHumanCall = async () => {
    if (!user || !isReady) return;
    setMode("connecting");

    const result = await startCallSession({
      ticketId: "placeholder" as any,
      callerId: user.id as any,
    });

    if (result.success) {
      setMode("human_call");
      // make call to available rep (placeholder identity)
      await makeCall("rep_available", result.callSessionId, "Support Agent");
    }
  };

  const handleHangUp = async () => {
    hangUp();
    if (callSessionId) {
      await endCallSession({ callSessionId: callSessionId as any });
    }
    setMode("idle");
    setTranscripts([]);
  };

  const addTranscript = (speaker: Transcript["speaker"], text: string) => {
    setTranscripts((prev) => [
      ...prev,
      { id: nanoid(), speaker, text, timestamp: Date.now() },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-3 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          disabled={mode !== "idle"}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Voice Support</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "idle" && "Choose your support type"}
            {mode === "connecting" && "Connecting..."}
            {mode === "ai_call" && "Speaking with SAGE"}
            {mode === "human_call" && "Speaking with Agent"}
          </p>
        </div>
      </div>

      {/* main content */}
      <div className="flex-1 space-y-6">
        {mode === "idle" ? (
          <div className="grid gap-4">
            <Card
              className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20"
              onClick={startAICall}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Talk to SAGE</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant AI voice support, no wait time
                  </p>
                </div>
                <Phone className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20"
              onClick={startHumanCall}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-sage-500/20 p-4">
                  <User className="h-8 w-8 text-sage-900" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Call Support Agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Speak with a human representative
                  </p>
                </div>
                <Phone className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 pt-8">
            <CallAvatar
              name={mode === "ai_call" ? "SAGE" : "Support Agent"}
              isRinging={mode === "connecting"}
            />

            {mode !== "connecting" && (
              <>
                <CallTimer startTime={callStartTime} />
                <CallControls
                  onHangUp={handleHangUp}
                  onToggleMute={() => setMuted(!isMuted)}
                  onToggleSpeaker={toggleSpeaker}
                />
              </>
            )}
          </div>
        )}

        {/* transcription panel - show during call */}
        {(mode === "ai_call" || mode === "human_call") && (
          <TranscriptionPanel transcripts={transcripts} />
        )}
      </div>
    </div>
  );
}
