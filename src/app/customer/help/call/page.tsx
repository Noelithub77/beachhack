"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCallStore } from "@/stores/call-store";
import { useVoiceCall } from "@/hooks/use-voice-call";
import { useAIVoice } from "@/hooks/use-ai-voice";
import { CallAvatar } from "@/components/call/call-avatar";
import { CallControls } from "@/components/call/call-controls";
import { CallTimer } from "@/components/call/call-timer";
import {
  TranscriptionPanel,
  type Transcript,
} from "@/components/call/transcription-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Phone,
  Bot,
  User,
  Building2,
  Pencil,
  Mic,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { nanoid } from "nanoid";
import Link from "next/link";

type CallMode = "idle" | "permission" | "connecting" | "ai_call" | "human_call";

export default function CallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { callStartTime, callSessionId, startCall, endCall } = useCallStore();

  const [mode, setMode] = useState<CallMode>("idle");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [pendingCallType, setPendingCallType] = useState<"ai" | "human" | null>(null);
  const pendingTranscriptRef = useRef<string>("");

  const vendorId = searchParams.get("vendor");

  const vendor = useQuery(
    api.functions.vendors.getById,
    vendorId ? { id: vendorId as Id<"vendors"> } : "skip"
  );

  const startCallSession = useMutation(api.functions.calls.start);
  const endCallSession = useMutation(api.functions.calls.end);

  // AI voice hook (for SAGE)
  const aiVoice = useAIVoice({
    onTranscript: (text, isFinal) => {
      if (isFinal && text.trim()) {
        addTranscript("customer", text);
        // TODO: send to AI and get response
        handleAIMessage(text);
      } else {
        pendingTranscriptRef.current = text;
      }
    },
    onError: (err) => {
      console.error("[AI Voice Error]", err);
    },
  });

  // Twilio voice hook (for human calls)
  const twilioVoice = useVoiceCall({
    identity: user?.id || "anonymous",
    onCallEnd: () => {
      setMode("idle");
      setTranscripts([]);
      setCurrentTicketId(null);
    },
  });

  // add transcript
  const addTranscript = useCallback((speaker: Transcript["speaker"], text: string) => {
    setTranscripts((prev) => [
      ...prev,
      { id: nanoid(), speaker, text, timestamp: Date.now() },
    ]);
  }, []);

  // handle AI message (placeholder - integrate with your AI backend)
  const handleAIMessage = useCallback(async (userMessage: string) => {
    // TODO: call your AI endpoint here
    // for now just echo back
    const response = `I heard you say: "${userMessage}". How can I help you with that?`;
    addTranscript("ai", response);
    await aiVoice.speak(response);
  }, [aiVoice, addTranscript]);

  // handle permission request
  const handleRequestPermission = useCallback(async (callType: "ai" | "human") => {
    setPendingCallType(callType);
    setMode("permission");

    let granted = false;
    if (callType === "ai") {
      granted = await aiVoice.requestPermission();
    } else {
      granted = await twilioVoice.requestPermission();
    }

    if (granted) {
      if (callType === "ai") {
        await startAICallInternal();
      } else {
        await startHumanCallInternal();
      }
    } else {
      setMode("idle");
      setPendingCallType(null);
    }
  }, [aiVoice, twilioVoice]);

  // start AI call (internal)
  const startAICallInternal = useCallback(async () => {
    if (!user || !vendorId) return;

    setMode("connecting");

    const result = await startCallSession({
      vendorId: vendorId as Id<"vendors">,
      callerId: user.id as Id<"users">,
    });

    if (result.success) {
      setCurrentTicketId(result.ticketId);
      startCall(result.callSessionId, "ai", "SAGE");
      setMode("ai_call");

      // greet user
      const greeting = "Hello! I'm SAGE, your AI support assistant. How can I help you today?";
      addTranscript("ai", greeting);

      // start listening and speak greeting
      await aiVoice.startListening();
      await aiVoice.speak(greeting);
    } else {
      setMode("idle");
    }
  }, [user, vendorId, startCallSession, startCall, addTranscript, aiVoice]);

  // start human call (internal)
  const startHumanCallInternal = useCallback(async () => {
    if (!user || !vendorId) return;

    setMode("connecting");

    const result = await startCallSession({
      vendorId: vendorId as Id<"vendors">,
      callerId: user.id as Id<"users">,
    });

    if (result.success) {
      setCurrentTicketId(result.ticketId);

      const connected = await twilioVoice.makeCall(
        "rep_available",
        result.callSessionId,
        "Support Agent"
      );

      if (connected) {
        setMode("human_call");
      } else {
        setMode("idle");
      }
    } else {
      setMode("idle");
    }
  }, [user, vendorId, startCallSession, twilioVoice]);

  // hang up
  const handleHangUp = useCallback(async () => {
    if (mode === "ai_call") {
      aiVoice.cleanup();
      endCall();
    } else if (mode === "human_call") {
      twilioVoice.hangUp();
    }

    if (callSessionId) {
      await endCallSession({ callSessionId: callSessionId as Id<"callSessions"> });
    }

    setMode("idle");
    setTranscripts([]);
    setCurrentTicketId(null);
  }, [mode, aiVoice, twilioVoice, callSessionId, endCallSession, endCall]);

  // check permissions on component init
  const permissionError = mode === "ai_call"
    ? aiVoice.error
    : mode === "human_call"
    ? twilioVoice.error
    : null;

  // vendor not selected
  if (!vendorId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Select a vendor first</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs mt-2">
          Please choose a vendor to start a voice call
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/customer/vendors?mode=ai")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Browse Vendors
        </Button>
      </div>
    );
  }

  // loading vendor
  if (vendor === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // vendor not found
  if (vendor === null) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Vendor not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/customer/vendors?mode=ai")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
      </div>
    );
  }

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
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Voice Support</h1>
          <p className="text-sm text-muted-foreground">
            {vendor.name}
            {mode === "idle" && " — Choose your support type"}
            {mode === "permission" && " — Requesting permission..."}
            {mode === "connecting" && " — Connecting..."}
            {mode === "ai_call" && " — Speaking with SAGE"}
            {mode === "human_call" && " — Speaking with Agent"}
          </p>
        </div>
      </div>

      {/* main content */}
      <div className="flex-1 space-y-6">
        {mode === "idle" && (
          <div className="grid gap-4">
            {/* permission status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {aiVoice.permissionGranted || twilioVoice.permissionGranted ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Microphone access granted
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Microphone permission will be requested when you start a call
                </>
              )}
            </div>

            {/* browser support warning */}
            {!aiVoice.isSupported && (
              <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">AI voice not supported in this browser</p>
                  <p className="text-xs mt-1">Use Chrome or Edge for AI voice calls. Human agent calls will still work.</p>
                </div>
              </div>
            )}

            {/* AI call option */}
            <Card
              className={`cursor-pointer transition-all hover:shadow-soft hover:border-primary/20 ${!aiVoice.isSupported ? "opacity-50" : ""}`}
              onClick={() => aiVoice.isSupported && handleRequestPermission("ai")}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Talk to SAGE</h3>
                  <p className="text-sm text-muted-foreground">
                    {aiVoice.isSupported
                      ? "Instant AI voice support, no wait time"
                      : "Not available in this browser"}
                  </p>
                </div>
                <Phone className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Human call option */}
            <Card
              className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20"
              onClick={() => handleRequestPermission("human")}
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

            {/* error display */}
            {(aiVoice.error || twilioVoice.error) && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {aiVoice.error || twilioVoice.error}
              </div>
            )}
          </div>
        )}

        {/* permission request screen */}
        {mode === "permission" && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="rounded-full bg-primary/10 p-6 animate-pulse">
              <Mic className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Microphone Access Required</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Please allow microphone access in your browser to start the call
              </p>
            </div>
            <Button variant="outline" onClick={() => setMode("idle")}>
              Cancel
            </Button>
          </div>
        )}

        {/* connecting screen */}
        {mode === "connecting" && (
          <div className="flex flex-col items-center gap-8 pt-8">
            <CallAvatar
              name={pendingCallType === "ai" ? "SAGE" : "Support Agent"}
              isRinging={true}
            />
            <p className="text-muted-foreground">Connecting...</p>
          </div>
        )}

        {/* active call screen */}
        {(mode === "ai_call" || mode === "human_call") && (
          <div className="flex flex-col items-center gap-8 pt-8">
            <CallAvatar
              name={mode === "ai_call" ? "SAGE" : "Support Agent"}
              isRinging={false}
            />

            <CallTimer startTime={callStartTime} />

            {/* listening indicator for AI calls */}
            {mode === "ai_call" && aiVoice.isListening && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Listening...
              </div>
            )}

            {mode === "ai_call" && aiVoice.isSpeaking && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                SAGE is speaking...
              </div>
            )}

            <CallControls
              onHangUp={handleHangUp}
              onToggleMute={() => {
                if (mode === "ai_call") {
                  if (aiVoice.isListening) {
                    aiVoice.stopListening();
                  } else {
                    aiVoice.startListening();
                  }
                } else {
                  twilioVoice.setMuted(!twilioVoice.isMuted);
                }
              }}
              onToggleSpeaker={twilioVoice.toggleSpeaker}
            />

            {/* error during call */}
            {permissionError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {permissionError}
              </div>
            )}
          </div>
        )}

        {/* ticket info */}
        {(mode === "ai_call" || mode === "human_call") && currentTicketId && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">Ticket created</p>
                <p className="text-xs text-muted-foreground">
                  Add details to help us assist you better
                </p>
              </div>
              <Link href={`/customer/tickets/${currentTicketId}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Add Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* transcription panel */}
        {(mode === "ai_call" || mode === "human_call") && transcripts.length > 0 && (
          <TranscriptionPanel transcripts={transcripts} />
        )}
      </div>
    </div>
  );
}
