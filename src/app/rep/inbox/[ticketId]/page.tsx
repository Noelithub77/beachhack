"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  User,
  Clock,
  Building,
  CheckCircle,
  ArrowUpRight,
  XCircle,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  MessageCircle,
  Mail,
} from "lucide-react";
import Link from "next/link";
import {
  TicketStatusBadge,
  TicketStatus,
} from "@/components/tickets/ticket-status-badge";
import { ChatInterface } from "@/components/chat/chat-interface";
import { AIContextPanel } from "@/components/tickets/ai-context-panel";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTwilioDevice } from "@/hooks/use-twilio-device";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import {
  TranscriptionPanel,
  type Transcript,
} from "@/components/call/transcription-panel";
import { CallTimer } from "@/components/call/call-timer";
import { useCallStore } from "@/stores/call-store";
import { cn } from "@/lib/utils";

export default function RepTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as Id<"tickets">;
  const { user } = useAuthStore();

  const ticket = useQuery(api.functions.tickets.getWithDetails, { ticketId });
  const conversation = useQuery(api.functions.conversations.getByTicket, {
    ticketId,
  });
  const createConversation = useMutation(api.functions.conversations.create);
  const assignTicket = useMutation(api.functions.tickets.assign);
  const updateStatus = useMutation(api.functions.tickets.updateStatus);
  const escalateTicket = useMutation(api.functions.tickets.escalate);

  const [creatingConversation, setCreatingConversation] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const { callStartTime, startCall, endCall } = useCallStore();

  const twilioDevice = useTwilioDevice({
    identity: user?.id ? `rep_${user.id}` : "",
    onIncomingCall: () => {},
    onCallDisconnect: () => {
      endCall();
      speech.stop();
    },
  });

  const speech = useSpeechRecognition({
    onTranscript: (text, isFinal) => {
      if (isFinal && text.trim()) {
        setTranscripts((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            speaker: "customer",
            text: text.trim(),
            timestamp: Date.now(),
          },
        ]);
      }
    },
  });

  useEffect(() => {
    if (ticket?.channel === "call" && user?.id) {
      twilioDevice.register();
    }
    return () => twilioDevice.unregister();
  }, [ticket?.channel, user?.id]);

  useEffect(() => {
    if (conversation === null && ticket && !creatingConversation) {
      setCreatingConversation(true);
      createConversation({ ticketId, channel: ticket.channel }).finally(() => {
        setCreatingConversation(false);
      });
    }
  }, [conversation, ticket, ticketId, createConversation, creatingConversation]);

  const handleAccept = async () => {
    if (!user?.id) return;
    setLoading("accept");
    try {
      await assignTicket({ ticketId, repId: user.id as Id<"users"> });
    } finally {
      setLoading(null);
    }
  };

  const handleStartProgress = async () => {
    setLoading("progress");
    try {
      await updateStatus({ ticketId, status: "in_progress" });
    } finally {
      setLoading(null);
    }
  };

  const handleResolve = async () => {
    setLoading("resolve");
    try {
      await updateStatus({ ticketId, status: "resolved" });
    } finally {
      setLoading(null);
    }
  };

  const handleEscalate = async () => {
    setLoading("escalate");
    try {
      await escalateTicket({ ticketId });
    } finally {
      setLoading(null);
    }
  };

  const handleClose = async () => {
    setLoading("close");
    try {
      await updateStatus({ ticketId, status: "closed" });
      router.push("/rep/inbox");
    } finally {
      setLoading(null);
    }
  };

  if (ticket === undefined || conversation === undefined) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#6f8551]" />
      </div>
    );
  }

  if (ticket === null) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-muted-foreground">Ticket not found</p>
        <Link href="/rep/inbox">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Inbox
          </Button>
        </Link>
      </div>
    );
  }

  const isAssignedToMe = ticket.assignedRepId === user?.id;
  const isUnassigned = !ticket.assignedRepId;

  const priorityConfig: Record<string, { bg: string; text: string; dot: string }> = {
    low: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    medium: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    high: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
    urgent: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  };

  return (
    <div className="h-full flex">
      {/* Left Column - Conversation */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-gray-200">
        {/* Header bar */}
        <div className="shrink-0 h-11 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/rep/inbox" className="shrink-0">
              <Button variant="ghost" size="sm" className="gap-1 h-7 px-2 text-muted-foreground hover:text-[#6f8551]">
                <ArrowLeft className="h-3.5 w-3.5" />
                Inbox
              </Button>
            </Link>
            <div className="h-4 w-px bg-gray-200 shrink-0" />
            <h1 className="font-medium text-sm text-[#2D3E2F] truncate">{ticket.subject}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] text-muted-foreground">#{ticket._id.slice(-8).toUpperCase()}</span>
            <TicketStatusBadge status={ticket.status as TicketStatus} />
          </div>
        </div>

        {/* Info strip */}
        <div className="shrink-0 h-9 flex items-center justify-between px-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
            </span>
            {ticket.vendor && (
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {ticket.vendor.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              {ticket.channel === "chat" && <MessageCircle className="h-3 w-3" />}
              {ticket.channel === "call" && <Phone className="h-3 w-3" />}
              {ticket.channel === "email" && <Mail className="h-3 w-3" />}
              <span className="capitalize">{ticket.channel}</span>
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
              priorityConfig[ticket.priority].bg,
              priorityConfig[ticket.priority].text
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", priorityConfig[ticket.priority].dot)} />
              {ticket.priority}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {isUnassigned && (
              <Button size="sm" onClick={handleAccept} disabled={loading !== null} className="h-6 text-[11px] px-2 bg-[#6f8551] hover:bg-[#5a6d42]">
                {loading === "accept" && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                Accept
              </Button>
            )}
            {isAssignedToMe && ticket.status === "assigned" && (
              <Button size="sm" onClick={handleStartProgress} disabled={loading !== null} className="h-6 text-[11px] px-2 bg-[#6f8551] hover:bg-[#5a6d42]">
                {loading === "progress" && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                Start
              </Button>
            )}
            {isAssignedToMe && ticket.status === "in_progress" && (
              <Button size="sm" onClick={handleResolve} disabled={loading !== null} className="h-6 text-[11px] px-2 bg-[#6f8551] hover:bg-[#5a6d42]">
                {loading === "resolve" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                Resolve
              </Button>
            )}
            {isAssignedToMe && ticket.status !== "closed" && ticket.status !== "resolved" && (
              <Button size="sm" variant="outline" onClick={handleEscalate} disabled={loading !== null} className="h-6 text-[11px] px-2">
                {loading === "escalate" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1" />}
                Escalate
              </Button>
            )}
            {ticket.status === "resolved" && (
              <Button size="sm" variant="outline" onClick={handleClose} disabled={loading !== null} className="h-6 text-[11px] px-2">
                {loading === "close" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Call UI */}
        {ticket.channel === "call" && isAssignedToMe && (
          <div className="shrink-0 px-4 py-2 border-b border-gray-200">
            {!twilioDevice.activeCall ? (
              <div className="flex items-center gap-2 py-1.5 px-3 bg-purple-50 rounded border border-purple-100">
                <Phone className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-xs text-purple-700 flex-1">
                  {twilioDevice.state === "ready" ? "Ready to call customer" : "Connecting..."}
                </span>
                <Button
                  size="sm"
                  className="h-6 text-xs bg-purple-600 hover:bg-purple-700"
                  disabled={twilioDevice.state !== "ready"}
                  onClick={async () => {
                    await twilioDevice.makeCall(`customer_${ticket.customerId}`);
                    startCall(`call_${ticketId}`, "Customer");
                    speech.start();
                    setTranscripts([]);
                  }}
                >
                  <Phone className="h-3 w-3 mr-1" /> Call
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 px-3 bg-green-50 rounded border border-green-100">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-500 p-1 animate-pulse">
                      <Phone className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-green-800">Call in progress</span>
                    <CallTimer startTime={callStartTime} />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => twilioDevice.mute(!twilioDevice.isMuted)}>
                      {twilioDevice.isMuted ? <MicOff className="h-3 w-3 text-red-500" /> : <Mic className="h-3 w-3" />}
                    </Button>
                    <Button variant="destructive" size="sm" className="h-6 text-xs" onClick={() => { twilioDevice.hangUp(); endCall(); speech.stop(); }}>
                      <PhoneOff className="h-3 w-3 mr-1" /> End
                    </Button>
                  </div>
                </div>
                <TranscriptionPanel transcripts={transcripts} className="h-20" />
              </div>
            )}
          </div>
        )}

        {/* Conversation label */}
        <div className="shrink-0 h-8 flex items-center px-4 border-b border-gray-200 bg-gray-50/50">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Conversation</span>
        </div>

        {/* Chat - fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {conversation ? (
            <ChatInterface conversationId={conversation._id} ticketId={ticketId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-[#6f8551]" />
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="w-72 shrink-0 flex flex-col bg-white overflow-hidden">
        {/* AI Panel */}
        <div className="flex-1 min-h-0 overflow-auto border-b border-gray-200">
          <AIContextPanel ticketId={ticketId} ticketSubject={ticket.subject} messages={[]} />
        </div>

        {/* Customer */}
        <div className="shrink-0 p-3 border-b border-gray-200">
          <div className="flex items-center gap-1.5 mb-2">
            <User className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Customer</span>
          </div>
          {ticket.customer ? (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#6f8551]/10 flex items-center justify-center shrink-0">
                <User className="h-3.5 w-3.5 text-[#6f8551]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#2D3E2F] truncate">{ticket.customer.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{ticket.customer.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">No customer info</p>
          )}
        </div>

        {/* Details */}
        <div className="shrink-0 p-3">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
            <div>
              <span className="text-gray-400 uppercase tracking-wide">Priority</span>
              <p className="font-medium text-[#2D3E2F] capitalize">{ticket.priority}</p>
            </div>
            <div>
              <span className="text-gray-400 uppercase tracking-wide">Channel</span>
              <p className="font-medium text-[#2D3E2F] capitalize">{ticket.channel}</p>
            </div>
            <div>
              <span className="text-gray-400 uppercase tracking-wide">Created</span>
              <p className="font-medium text-[#2D3E2F]">{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
            {ticket.rep && (
              <div>
                <span className="text-gray-400 uppercase tracking-wide">Assigned</span>
                <p className="font-medium text-[#2D3E2F] truncate">{ticket.rep.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
