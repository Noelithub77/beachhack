"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCallStore } from "@/stores/call-store";
import { useElevenLabsConversation } from "@/hooks/use-elevenlabs-conversation";
import { CallAvatar } from "@/components/call/call-avatar";
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
  Building2,
  Mic,
  MicOff,
  PhoneOff,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import Link from "next/link";

type CallMode = "idle" | "connecting" | "active";

export default function CallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { callStartTime, startCall, endCall, setAgentMode } = useCallStore();

  const [mode, setMode] = useState<CallMode>("idle");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);

  const vendorId = searchParams.get("vendor");

  const vendor = useQuery(
    api.functions.vendors.getById,
    vendorId ? { id: vendorId as Id<"vendors"> } : "skip",
  );

  const startCallSession = useMutation(api.functions.calls.start);
  const endCallSession = useMutation(api.functions.calls.end);

  // ElevenLabs conversation hook
  const conversation = useElevenLabsConversation({
    onMessage: (message) => {
      setTranscripts((prev) => [
        ...prev,
        {
          id: message.id,
          speaker: message.role === "user" ? "customer" : "ai",
          text: message.text,
          timestamp: message.timestamp,
        },
      ]);
    },
    onStatusChange: (status) => {
      if (status === "connected") {
        setMode("active");
      } else if (status === "disconnected") {
        setMode("idle");
      }
    },
    onModeChange: (agentMode) => {
      setAgentMode(agentMode);
    },
    onError: (error) => {
      console.error("[Call] Error:", error);
    },
  });

  // start call
  const handleStartCall = useCallback(async () => {
    if (!user || !vendorId) return;

    setMode("connecting");

    // create call session in backend
    const result = await startCallSession({
      vendorId: vendorId as Id<"vendors">,
      callerId: user.id as Id<"users">,
    });

    if (!result.success) {
      setMode("idle");
      return;
    }

    setCurrentTicketId(result.ticketId);

    // start ElevenLabs conversation with context
    const convId = await conversation.startConversation({
      vendorName: vendor?.name,
      vendorContext: vendor?.description,
      userName: user.name,
      userId: user.id,
    });

    if (convId) {
      startCall(convId, "SAGE");
    } else {
      setMode("idle");
    }
  }, [user, vendorId, vendor, startCallSession, conversation, startCall]);

  // end call
  const handleHangUp = useCallback(async () => {
    await conversation.endConversation();
    endCall();

    if (currentTicketId) {
      await endCallSession({
        callSessionId: currentTicketId as Id<"callSessions">,
      });
    }

    setMode("idle");
    setTranscripts([]);
    setCurrentTicketId(null);
  }, [conversation, endCall, currentTicketId, endCallSession]);

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
            {mode === "idle" && " — Ready to connect"}
            {mode === "connecting" && " — Connecting..."}
            {mode === "active" && " — Speaking with SAGE"}
          </p>
        </div>
      </div>

      {/* main content */}
      <div className="flex-1 space-y-6">
        {/* idle state - start call button */}
        {mode === "idle" && (
          <div className="grid gap-4">
            {/* error display */}
            {conversation.error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Connection Error</p>
                  <p className="text-xs mt-1">{conversation.error}</p>
                </div>
              </div>
            )}

            {/* AI call option */}
            <Card
              className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20"
              onClick={handleStartCall}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Talk to SAGE</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered voice support for {vendor.name}
                  </p>
                </div>
                <Phone className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* connecting state */}
        {mode === "connecting" && (
          <div className="flex flex-col items-center gap-8 pt-8">
            <CallAvatar name="SAGE" isRinging={true} />
            <p className="text-muted-foreground">Connecting to SAGE...</p>
          </div>
        )}

        {/* active call */}
        {mode === "active" && (
          <div className="flex flex-col items-center gap-8 pt-8">
            <CallAvatar name="SAGE" isRinging={false} />
            <CallTimer startTime={callStartTime} />

            {/* agent mode indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className={`h-2 w-2 rounded-full animate-pulse ${
                  conversation.agentMode === "speaking"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              />
              {conversation.agentMode === "speaking"
                ? "SAGE is speaking..."
                : "Listening..."}
            </div>

            {/* call controls */}
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={conversation.toggleMute}
              >
                {conversation.isMuted ? (
                  <MicOff className="h-6 w-6 text-red-500" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="h-16 w-16 rounded-full"
                onClick={handleHangUp}
              >
                <PhoneOff className="h-7 w-7" />
              </Button>
            </div>

            {/* error during call */}
            {conversation.error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {conversation.error}
              </div>
            )}
          </div>
        )}

        {/* ticket info */}
        {mode === "active" && currentTicketId && (
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
                  View Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* transcription panel */}
        {transcripts.length > 0 && (
          <TranscriptionPanel transcripts={transcripts} />
        )}
      </div>
    </div>
  );
}
