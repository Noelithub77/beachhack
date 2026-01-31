"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  PhoneIncoming,
  PhoneCall,
  Wifi,
  WifiOff,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTwilioDevice } from "@/hooks/use-twilio-device";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { RepSuggestionPanel } from "@/components/call/rep-suggestion-panel";
import { CallTimer } from "@/components/call/call-timer";
import { TranscriptionPanel } from "@/components/call/transcription-panel";
import { useCallStore } from "@/stores/call-store";

export default function RepCallCenter() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { callStartTime, startCall, endCall } = useCallStore();

  const [transcripts, setTranscripts] = useState<
    {
      id: string;
      speaker: "customer" | "ai" | "rep";
      text: string;
      timestamp: number;
    }[]
  >([]);
  const [callerIdentity, setCallerIdentity] = useState<string | null>(null);

  // Twilio device
  const device = useTwilioDevice({
    identity: user?.id ? `rep_${user.id}` : "",
    onIncomingCall: (call) => {
      // extract caller identity from call parameters
      const from = call.parameters?.From || "Unknown";
      setCallerIdentity(from);
    },
    onCallDisconnect: () => {
      endCall();
      speech.stop();
      setCallerIdentity(null);
    },
  });

  // speech recognition for transcription
  const speech = useSpeechRecognition({
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

  // register device on mount
  useEffect(() => {
    if (user?.id) {
      device.register();
    }
    return () => device.unregister();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // start transcription when call is active
  useEffect(() => {
    if (device.activeCall && speech.isSupported) {
      speech.start();
      startCall(callerIdentity || "customer_call", "Customer");
    } else {
      speech.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.activeCall]);

  const handleAccept = () => {
    device.acceptCall();
    setTranscripts([]);
    speech.reset();
  };

  const handleReject = () => {
    device.rejectCall();
    setCallerIdentity(null);
  };

  const handleHangUp = () => {
    device.hangUp();
    endCall();
    speech.stop();
  };

  const fullTranscript = transcripts.map((t) => t.text).join(" ");

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Call Center</h1>
          <p className="text-sm text-muted-foreground">
            Receive and manage customer calls
          </p>
        </div>
        {/* device status */}
        <div className="flex items-center gap-2">
          {device.state === "ready" ? (
            <div className="flex items-center gap-1.5 text-sm text-green-600">
              <Wifi className="h-4 w-4" />
              Online
            </div>
          ) : device.state === "registering" ? (
            <div className="flex items-center gap-1.5 text-sm text-yellow-600">
              <Wifi className="h-4 w-4 animate-pulse" />
              Connecting...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <WifiOff className="h-4 w-4" />
              Offline
            </div>
          )}
        </div>
      </div>

      {/* error display */}
      {device.error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            {device.error}
          </CardContent>
        </Card>
      )}

      {/* incoming call notification */}
      {device.incomingCall && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500 p-4">
                <PhoneIncoming className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Incoming Call</h3>
                <p className="text-sm text-muted-foreground">
                  {callerIdentity || "Customer calling..."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" size="lg" onClick={handleReject}>
                  <PhoneOff className="h-5 w-5 mr-2" />
                  Decline
                </Button>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleAccept}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Accept
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* active call */}
      {device.activeCall && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* main call UI */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-6">
                  {/* caller avatar */}
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      <PhoneCall className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <p className="font-semibold text-lg">
                      {callerIdentity || "Customer"}
                    </p>
                    <CallTimer startTime={callStartTime} />
                  </div>

                  {/* call controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-full"
                      onClick={() => device.mute(!device.isMuted)}
                    >
                      {device.isMuted ? (
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
                </div>
              </CardContent>
            </Card>

            {/* transcription panel */}
            <TranscriptionPanel transcripts={transcripts} />
          </div>

          {/* AI suggestions panel */}
          <div className="space-y-4">
            <RepSuggestionPanel
              transcript={fullTranscript}
              userId={callerIdentity?.replace("customer_", "") || undefined}
              isActive={!!device.activeCall}
            />
          </div>
        </div>
      )}

      {/* idle state */}
      {!device.incomingCall && !device.activeCall && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Phone className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">Ready for calls</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {device.state === "ready"
                ? "You'll be notified when a customer calls"
                : "Connecting to call service..."}
            </p>
            {device.state !== "ready" && device.state !== "registering" && (
              <Button className="mt-4" onClick={() => device.register()}>
                Reconnect
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
