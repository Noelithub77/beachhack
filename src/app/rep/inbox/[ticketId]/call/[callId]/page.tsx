"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Phone,
  PhoneOff,
  Clock,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type TranscriptItem = {
  role: string;
  content: string;
  timestamp?: number;
};

export default function CallResultsPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as Id<"tickets">;
  const callId = params.callId as Id<"outboundCalls">;

  const call = useQuery(api.functions.outboundCalls.get, { callId });
  const saveTranscript = useMutation(
    api.functions.outboundCalls.saveTranscript,
  );
  const updateStatus = useMutation(api.functions.outboundCalls.updateStatus);

  const [polling, setPolling] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const isActive =
    call?.status === "initiating" ||
    call?.status === "ringing" ||
    call?.status === "in_progress";

  // fetch conversation from ElevenLabs
  const fetchConversation = useCallback(async () => {
    if (!call?.conversationId) return;
    setPolling(true);
    try {
      const response = await fetch(
        `/api/elevenlabs/conversation/${call.conversationId}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      setLastFetch(new Date());

      // update status if changed
      const statusMap: Record<string, string> = {
        initiated: "ringing",
        "in-progress": "in_progress",
        processing: "in_progress",
        done: "completed",
        failed: "failed",
      };
      const newStatus = statusMap[data.status] || call.status;
      if (newStatus !== call.status) {
        await updateStatus({
          callId,
          status: newStatus,
          duration: data.call_duration_secs,
          endedAt:
            newStatus === "completed" || newStatus === "failed"
              ? Date.now()
              : undefined,
        });
      }

      // save transcript if completed
      if (data.status === "done" && data.transcript) {
        const transcript: TranscriptItem[] = data.transcript.map(
          (t: {
            role: string;
            message: string;
            time_in_call_secs?: number;
          }) => ({
            role: t.role === "agent" ? "agent" : "user",
            content: t.message,
            timestamp: t.time_in_call_secs
              ? t.time_in_call_secs * 1000
              : undefined,
          }),
        );
        await saveTranscript({
          callId,
          transcript,
          summary: data.analysis?.summary || data.transcript_summary,
          duration: data.call_duration_secs,
        });
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    } finally {
      setPolling(false);
    }
  }, [
    call?.conversationId,
    call?.status,
    callId,
    saveTranscript,
    updateStatus,
  ]);

  // poll while active
  useEffect(() => {
    if (!isActive || !call?.conversationId) return;
    const interval = setInterval(fetchConversation, 3000);
    fetchConversation();
    return () => clearInterval(interval);
  }, [isActive, call?.conversationId, fetchConversation]);

  if (call === undefined) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#6f8551]" />
      </div>
    );
  }

  if (call === null) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-muted-foreground">Call not found</p>
        <Link href={`/rep/inbox/${ticketId}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Ticket
          </Button>
        </Link>
      </div>
    );
  }

  const statusConfig: Record<
    string,
    { icon: React.ElementType; color: string; bg: string; label: string }
  > = {
    initiating: {
      icon: Loader2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Initiating",
    },
    ringing: {
      icon: Phone,
      color: "text-amber-600",
      bg: "bg-amber-50",
      label: "Ringing",
    },
    in_progress: {
      icon: Phone,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "In Progress",
    },
    completed: {
      icon: CheckCircle,
      color: "text-[#6f8551]",
      bg: "bg-[#6f8551]/10",
      label: "Completed",
    },
    failed: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Failed",
    },
  };

  const status = statusConfig[call.status] || statusConfig.initiating;
  const StatusIcon = status.icon;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="shrink-0 h-12 flex items-center justify-between px-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <Link href={`/rep/inbox/${ticketId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Ticket
            </Button>
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <h1 className="font-medium text-[#2D3E2F]">AI Agent Call</h1>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchConversation}
              disabled={polling}
              className="h-8 gap-1.5"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", polling && "animate-spin")}
              />
              Refresh
            </Button>
          )}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              status.bg,
              status.color,
            )}
          >
            <StatusIcon
              className={cn(
                "h-3.5 w-3.5",
                call.status === "initiating" && "animate-spin",
              )}
            />
            {status.label}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Call Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Call Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#6f8551]/10 flex items-center justify-center">
                <User className="h-5 w-5 text-[#6f8551]" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {call.customer?.name || "Customer"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {call.phoneNumber}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Started</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(call.startedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {call.duration && (
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-medium">
                    {Math.floor(call.duration / 60)}m {call.duration % 60}s
                  </p>
                </div>
              )}
              {lastFetch && (
                <div>
                  <span className="text-muted-foreground">Last Updated</span>
                  <p className="font-medium">
                    {formatDistanceToNow(lastFetch, { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {call.summary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Call Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{call.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Transcript */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Transcript
              {isActive && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {call.transcript && call.transcript.length > 0 ? (
              <div className="space-y-3">
                {call.transcript.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2",
                      item.role === "agent" ? "justify-start" : "justify-end",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        item.role === "agent"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-[#6f8551] text-white",
                      )}
                    >
                      <p className="text-[10px] font-medium mb-0.5 opacity-70">
                        {item.role === "agent" ? "SAGE" : "Customer"}
                      </p>
                      <p>{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                {isActive ? (
                  <>
                    <Phone className="h-8 w-8 mb-2 animate-pulse" />
                    <p className="text-sm">Call in progress...</p>
                    <p className="text-xs">Transcript will appear here</p>
                  </>
                ) : (
                  <>
                    <PhoneOff className="h-8 w-8 mb-2" />
                    <p className="text-sm">No transcript available</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
