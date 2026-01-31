"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCallStore } from "@/stores/call-store";
import { useElevenLabsConversation } from "@/hooks/use-elevenlabs-conversation";
import { useTwilioDevice } from "@/hooks/use-twilio-device";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { CallAvatar } from "@/components/call/call-avatar";
import { CallTimer } from "@/components/call/call-timer";
import {
  TranscriptionPanel,
  type Transcript,
} from "@/components/call/transcription-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  ArrowLeft,
  Phone,
  Bot,
  Building2,
  Mic,
  MicOff,
  PhoneOff,
  AlertCircle,
  PhoneOutgoing,
  Loader2,
  UserRound,
  CheckCircle,
  Headphones,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import Link from "next/link";

type CallMode = "idle" | "connecting" | "active" | "rep_call";
type OutboundCallStatus = "idle" | "initiating" | "queued" | "error";
type CallbackStatus = "idle" | "requesting" | "requested";

export default function CallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { callStartTime, startCall, endCall, setAgentMode } = useCallStore();

  const [mode, setMode] = useState<CallMode>("idle");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [currentCallSessionId, setCurrentCallSessionId] = useState<
    string | null
  >(null);

  // outbound call state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [outboundStatus, setOutboundStatus] =
    useState<OutboundCallStatus>("idle");
  const [outboundError, setOutboundError] = useState<string | null>(null);
  const [outboundCallSid, setOutboundCallSid] = useState<string | null>(null);

  // callback request state
  const [callbackStatus, setCallbackStatus] = useState<CallbackStatus>("idle");
  const [callbackTicketId, setCallbackTicketId] = useState<string | null>(null);

  const vendorId = searchParams.get("vendor");

  const vendor = useQuery(
    api.functions.vendors.getById,
    vendorId ? { id: vendorId as Id<"vendors"> } : "skip",
  );

  const startCallSession = useMutation(api.functions.calls.start);
  const endCallSession = useMutation(api.functions.calls.end);
  const createTicket = useMutation(api.functions.tickets.create);

  // Twilio device for calling reps
  const twilioDevice = useTwilioDevice({
    identity: user?.id ? `customer_${user.id}` : "",
    onCallDisconnect: () => {
      setMode("idle");
      endCall();
      repSpeech.stop();
    },
  });

  // speech recognition for rep calls
  const repSpeech = useSpeechRecognition({
    onTranscript: (text, isFinal) => {
      if (isFinal && text.trim()) {
        setTranscripts((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            speaker: "customer" as const,
            text: text.trim(),
            timestamp: Date.now(),
          },
        ]);
      }
    },
  });

  // register Twilio device on mount
  useEffect(() => {
    if (user?.id) {
      twilioDevice.register();
    }
    return () => twilioDevice.unregister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  // start WebRTC call
  const handleStartCall = useCallback(async () => {
    if (!user || !vendorId) return;

    setMode("connecting");

    const result = await startCallSession({
      vendorId: vendorId as Id<"vendors">,
      callerId: user.id as Id<"users">,
    });

    if (!result.success) {
      setMode("idle");
      return;
    }

    setCurrentTicketId(result.ticketId);
    setCurrentCallSessionId(result.callSessionId);

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

  // start outbound phone call
  const handleOutboundCall = useCallback(async () => {
    if (!phoneNumber) return;

    setOutboundStatus("initiating");
    setOutboundError(null);

    try {
      const res = await fetch("/api/elevenlabs/outbound-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toNumber: phoneNumber,
          vendorName: vendor?.name,
          userName: user?.name,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate call");
      }

      setOutboundStatus("queued");
      setOutboundCallSid(data.callSid);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to call";
      setOutboundError(msg);
      setOutboundStatus("error");
    }
  }, [phoneNumber, vendor, user]);

  // reset outbound call
  const resetOutboundCall = useCallback(() => {
    setOutboundStatus("idle");
    setOutboundError(null);
    setOutboundCallSid(null);
    setPhoneNumber("");
  }, []);

  // end WebRTC call
  const handleHangUp = useCallback(async () => {
    await conversation.endConversation();
    endCall();

    if (user?.id && transcripts.length > 0) {
      try {
        await fetch("/api/memory/sync-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            ticketId: currentTicketId,
            vendorName: vendor?.name,
            transcripts: transcripts.map((t) => ({
              speaker: t.speaker,
              text: t.text,
            })),
          }),
        });
      } catch (error) {
        console.error("[Call] Transcript sync error:", error);
      }
    }

    if (currentCallSessionId) {
      await endCallSession({
        callSessionId: currentCallSessionId as Id<"callSessions">,
      });
    }

    setMode("idle");
    setTranscripts([]);
    setCurrentTicketId(null);
    setCurrentCallSessionId(null);
  }, [
    conversation,
    endCall,
    currentCallSessionId,
    endCallSession,
    user,
    transcripts,
    currentTicketId,
    vendor,
  ]);

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
        {/* idle state - call options */}
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

            {/* AI call option (WebRTC) */}
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

            {/* Outbound call option */}
            <Card className="transition-all overflow-visible">
              <CardContent className="p-6 overflow-visible">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-500/10 p-3 shrink-0">
                    <PhoneOutgoing className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="min-w-0 shrink-0">
                    <h3 className="font-semibold">Call a Number</h3>
                    <p className="text-xs text-muted-foreground">
                      SAGE calls on your behalf
                    </p>
                  </div>

                  {outboundStatus === "idle" && (
                    <div className="flex-1 flex gap-2 items-center justify-end">
                      <div className="flex-1 max-w-xs">
                        <PhoneInput
                          defaultCountry="IN"
                          value={phoneNumber}
                          onChange={setPhoneNumber}
                          placeholder="Phone number"
                        />
                      </div>
                      <Button
                        onClick={handleOutboundCall}
                        disabled={!phoneNumber || phoneNumber.length < 10}
                        size="sm"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  )}

                  {outboundStatus === "initiating" && (
                    <div className="flex-1 flex items-center justify-end gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Initiating call...
                    </div>
                  )}

                  {outboundStatus === "queued" && (
                    <div className="flex-1 flex items-center justify-end gap-3">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Phone className="h-4 w-4" />
                        Call initiated!
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetOutboundCall}
                      >
                        New Call
                      </Button>
                    </div>
                  )}

                  {outboundError && (
                    <div className="flex-1 flex items-center justify-end gap-2">
                      <span className="text-sm text-destructive">
                        {outboundError}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetOutboundCall}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Request callback from rep */}
            <Card className="transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-500/10 p-4">
                    <UserRound className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Request Callback from Rep</h3>
                    <p className="text-sm text-muted-foreground">
                      A representative will call you back
                    </p>
                  </div>
                  {callbackStatus === "idle" && (
                    <Button
                      onClick={async () => {
                        if (!user || !vendorId) return;
                        setCallbackStatus("requesting");
                        try {
                          const result = await createTicket({
                            customerId: user.id as Id<"users">,
                            vendorId: vendorId as Id<"vendors">,
                            channel: "call",
                            priority: "medium",
                            subject: "Callback request",
                            description:
                              "Customer requested a callback from a representative.",
                          });
                          if (result.success) {
                            setCallbackTicketId(result.ticketId);
                            setCallbackStatus("requested");
                          }
                        } catch {
                          setCallbackStatus("idle");
                        }
                      }}
                    >
                      Request
                    </Button>
                  )}
                  {callbackStatus === "requesting" && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {callbackStatus === "requested" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                {callbackStatus === "requested" && callbackTicketId && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-green-600 font-medium">
                      Request submitted!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      A rep will accept your request and their contact will
                      appear on your ticket.
                    </p>
                    <Link href={`/customer/tickets/${callbackTicketId}`}>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Ticket
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Call Rep Now via WebRTC */}
            <Card className="transition-all hover:shadow-soft hover:border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-500/10 p-4">
                    <Headphones className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Call Rep Now</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect directly via browser
                    </p>
                  </div>
                  {twilioDevice.state === "ready" ? (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={async () => {
                        if (!vendorId) return;
                        setMode("rep_call");
                        // call any available rep for this vendor
                        await twilioDevice.makeCall(`rep_vendor_${vendorId}`);
                        startCall(`rep_${vendorId}`, "Rep");
                        repSpeech.start();
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {twilioDevice.state === "registering"
                        ? "Connecting..."
                        : "Offline"}
                    </span>
                  )}
                </div>
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

        {/* live transcription panel - always visible during call */}
        {mode === "active" && <TranscriptionPanel transcripts={transcripts} />}
      </div>
    </div>
  );
}
