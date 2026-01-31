"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Clock,
  Building2,
  Tag,
  AlertCircle,
  Zap,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import {
  TicketStatusBadge,
  TicketStatus,
} from "@/components/tickets/ticket-status-badge";
import { ChatInterface } from "@/components/chat/chat-interface";
import { AIChatInterface } from "@/components/chat/ai-chat-interface";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as Id<"tickets">;
  const { user } = useAuthStore();
  const [showDetails, setShowDetails] = useState(false);

  const ticket = useQuery(api.functions.tickets.getWithDetails, { ticketId });
  const conversation = useQuery(api.functions.conversations.getByTicket, {
    ticketId,
  });
  const createConversation = useMutation(api.functions.conversations.create);

  const [creatingConversation, setCreatingConversation] = useState(false);

  useEffect(() => {
    if (conversation === null && ticket && !creatingConversation) {
      setCreatingConversation(true);
      createConversation({ ticketId, channel: ticket.channel }).finally(() => {
        setCreatingConversation(false);
      });
    }
  }, [
    conversation,
    ticket,
    ticketId,
    createConversation,
    creatingConversation,
  ]);

  if (ticket === undefined || conversation === undefined) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6f8551]" />
      </div>
    );
  }

  if (ticket === null) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Ticket not found</p>
        <Link href="/customer/tickets">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
      </div>
    );
  }

  const priorityConfig: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    low: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
    medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    high: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
    urgent: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };

  const hasDetails =
    ticket.category ||
    ticket.severity ||
    ticket.description ||
    ticket.urgency ||
    ticket.preferredContact;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      {/* Compact header bar */}
      <div className="shrink-0 flex items-center justify-between px-1 py-2 border-b border-[#6f8551]/10 bg-white/50">
        <Link href="/customer/tickets">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-[#6f8551] h-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="text-sm">Back</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            #{ticket._id.slice(-8).toUpperCase()}
          </span>
          <span className="text-muted-foreground/30">|</span>
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(ticket.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Compact ticket info strip */}
      <div className="shrink-0 bg-gradient-to-r from-[#f8faf6] to-white border-b border-[#6f8551]/10">
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Title and vendor */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-semibold text-[#2D3E2F] truncate">
                  {ticket.subject}
                </h1>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {ticket.vendor && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>{ticket.vendor.name}</span>
                  </div>
                )}
                {ticket.channel && (
                  <div className="flex items-center gap-1">
                    {ticket.channel === "chat" && (
                      <MessageCircle className="h-3 w-3" />
                    )}
                    {ticket.channel === "call" && <Phone className="h-3 w-3" />}
                    {ticket.channel === "email" && <Mail className="h-3 w-3" />}
                    <span className="capitalize">{ticket.channel}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Status and priority badges */}
            <div className="flex items-center gap-2 shrink-0">
              <TicketStatusBadge status={ticket.status as TicketStatus} />
              {ticket.currentSupportLevel && (
                <div className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-1">
                  <span className="text-xs font-bold text-blue-700">
                    {ticket.currentSupportLevel} SUPPORT
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  priorityConfig[ticket.priority].bg,
                  priorityConfig[ticket.priority].text,
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    priorityConfig[ticket.priority].dot,
                  )}
                />
                {ticket.priority}
              </div>
            </div>
          </div>

          {/* Expandable details section */}
          {hasDetails && (
            <div className="mt-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-xs text-[#6f8551] hover:text-[#5a6d42] transition-colors"
              >
                {showDetails ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {showDetails ? "Hide details" : "Show details"}
              </button>

              {showDetails && (
                <div className="mt-2 pt-2 border-t border-[#6f8551]/10 space-y-2">
                  {ticket.description && (
                    <p className="text-xs text-muted-foreground">
                      {ticket.description}
                    </p>
                  )}

                  {/* Escalation info */}
                  {ticket.escalatedFrom && ticket.escalatedAt && (
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-900">
                          Escalated to {ticket.currentSupportLevel}
                        </p>
                        <p className="text-xs text-blue-700">
                          {formatDistanceToNow(new Date(ticket.escalatedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {ticket.category && (
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] h-5 px-1.5"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {ticket.category}
                      </Badge>
                    )}
                    {ticket.severity && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 text-[10px] h-5 px-1.5",
                          ticket.severity === "critical"
                            ? "border-red-400 text-red-600"
                            : ticket.severity === "major"
                              ? "border-orange-400 text-orange-600"
                              : "",
                        )}
                      >
                        <AlertCircle className="h-2.5 w-2.5" />
                        {ticket.severity}
                      </Badge>
                    )}
                    {ticket.urgency && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 text-[10px] h-5 px-1.5",
                          ticket.urgency === "immediate"
                            ? "border-red-400 text-red-600"
                            : ticket.urgency === "high"
                              ? "border-orange-400 text-orange-600"
                              : "",
                        )}
                      >
                        <Zap className="h-2.5 w-2.5" />
                        {ticket.urgency}
                      </Badge>
                    )}
                    {ticket.preferredContact && (
                      <Badge className="gap-1 text-[10px] h-5 px-1.5 bg-[#6f8551]/10 text-[#6f8551] hover:bg-[#6f8551]/20">
                        {ticket.preferredContact === "call" && (
                          <Phone className="h-2.5 w-2.5" />
                        )}
                        {ticket.preferredContact === "email" && (
                          <Mail className="h-2.5 w-2.5" />
                        )}
                        {ticket.preferredContact === "chat" && (
                          <MessageCircle className="h-2.5 w-2.5" />
                        )}
                        Prefers {ticket.preferredContact}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rep callback info for call tickets - compact version */}
          {ticket.channel === "call" && ticket.rep && (
            <div className="mt-2 flex items-center gap-2 py-1.5 px-2 bg-green-50 rounded-md border border-green-200">
              <Phone className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-green-700">
                {ticket.rep.name} will call you
                {ticket.rep.phoneNumber && ` • ${ticket.rep.phoneNumber}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chat section - fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        {ticket.currentSupportLevel && ticket.currentSupportLevel !== "L1" && (
          <div className="shrink-0 px-4 py-2 bg-blue-50 border-b border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              Your request is being handled by {ticket.currentSupportLevel}{" "}
              Support
            </p>
          </div>
        )}
        <div className="shrink-0 px-4 py-2 border-b border-[#6f8551]/10 bg-[#fafcf8]">
          <h2 className="text-sm font-medium text-[#2D3E2F]">Conversation</h2>
        </div>
        <div className="flex-1 min-h-0">
          {conversation ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-[#6f8551]" />
                </div>
              }
            >
              {ticket.assignedRepId ? (
                <ChatInterface
                  conversationId={conversation._id}
                  ticketId={ticketId}
                />
              ) : (
                <AIChatInterface
                  conversationId={conversation._id}
                  ticketId={ticketId}
                  vendorName={ticket.vendor?.name}
                />
              )}
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-[#6f8551]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
