"use client";

import { useState } from "react";
import {
  Inbox,
  Clock,
  CheckCircle,
  Loader2,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  Check,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/stores/auth-store";
import { Id } from "../../../../convex/_generated/dataModel";
import { TicketStatusBadge, TicketStatus } from "@/components/tickets/ticket-status-badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ChannelFilter = "all" | "chat" | "call" | "email";

const priorityConfig: Record<string, { dot: string }> = {
  low: { dot: "bg-slate-400" },
  medium: { dot: "bg-amber-500" },
  high: { dot: "bg-orange-500" },
  urgent: { dot: "bg-red-500" },
};

export default function RepInbox() {
  const { user } = useAuthStore();
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const assignTicket = useMutation(api.functions.tickets.assign);

  const unassigned = useQuery(
    api.functions.tickets.listUnassigned,
    user?.vendorId
      ? {
          vendorId: user.vendorId as Id<"vendors">,
          channel: channelFilter === "all" ? undefined : channelFilter,
        }
      : {
          channel: channelFilter === "all" ? undefined : channelFilter,
        },
  );

  const allUnassigned = useQuery(
    api.functions.tickets.listUnassigned,
    user?.vendorId ? { vendorId: user.vendorId as Id<"vendors"> } : {},
  );

  const assigned = useQuery(
    api.functions.tickets.listByRep,
    user?.id ? { repId: user.id as Id<"users"> } : "skip",
  );

  const handleAccept = async (ticketId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id) return;
    setAcceptingId(ticketId);
    try {
      await assignTicket({ ticketId: ticketId as Id<"tickets">, repId: user.id as Id<"users"> });
    } finally {
      setAcceptingId(null);
    }
  };

  const resolvedToday = assigned?.filter((t) => {
    if (t.status !== "resolved" || !t.resolvedAt) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return t.resolvedAt >= today.getTime();
  }).length ?? 0;

  const inProgress = assigned?.filter(
    (t) => t.status === "in_progress" || t.status === "assigned",
  ).length ?? 0;

  const chatCount = allUnassigned?.filter((t) => t.channel === "chat").length ?? 0;
  const callCount = allUnassigned?.filter((t) => t.channel === "call").length ?? 0;
  const emailCount = allUnassigned?.filter((t) => t.channel === "email").length ?? 0;

  const myActiveTickets = assigned?.filter(
    (t) => t.status !== "closed" && t.status !== "resolved"
  ) ?? [];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Compact header with stats */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold text-[#2D3E2F]">Inbox</h1>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-[#6f8551]/10">
                <Inbox className="h-3 w-3 text-[#6f8551]" />
              </div>
              <span className="font-medium">{allUnassigned?.length ?? 0}</span>
              <span className="text-muted-foreground">new</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-amber-100">
                <Clock className="h-3 w-3 text-amber-600" />
              </div>
              <span className="font-medium">{inProgress}</span>
              <span className="text-muted-foreground">active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-green-100">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <span className="font-medium">{resolvedToday}</span>
              <span className="text-muted-foreground">resolved</span>
            </div>
          </div>
        </div>
        
        <Tabs value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelFilter)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs h-6 px-2">
              All ({allUnassigned?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs h-6 px-2 gap-1">
              <MessageCircle className="h-3 w-3" />
              {chatCount}
            </TabsTrigger>
            <TabsTrigger value="call" className="text-xs h-6 px-2 gap-1">
              <Phone className="h-3 w-3" />
              {callCount}
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs h-6 px-2 gap-1">
              <Mail className="h-3 w-3" />
              {emailCount}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main list area */}
      <div className="flex-1 overflow-auto">
        {/* My Assigned Section */}
        {myActiveTickets.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-4 py-2 bg-[#fafcf8] border-b border-gray-100">
              <span className="text-[10px] font-medium text-[#6f8551] uppercase tracking-wide">
                My Tickets ({myActiveTickets.length})
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {myActiveTickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  href={`/rep/inbox/${ticket._id}`}
                  className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                >
                  {/* Channel icon */}
                  <div className="w-8 shrink-0">
                    {ticket.channel === "chat" && <MessageCircle className="h-4 w-4 text-gray-400" />}
                    {ticket.channel === "call" && <Phone className="h-4 w-4 text-gray-400" />}
                    {ticket.channel === "email" && <Mail className="h-4 w-4 text-gray-400" />}
                  </div>
                  
                  {/* Priority dot */}
                  <div className="w-4 shrink-0">
                    <span className={cn("w-2 h-2 rounded-full inline-block", priorityConfig[ticket.priority].dot)} />
                  </div>
                  
                  {/* Subject */}
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-sm font-medium text-[#2D3E2F] truncate block">{ticket.subject}</span>
                  </div>
                  
                  {/* Status */}
                  <div className="w-24 shrink-0">
                    <TicketStatusBadge status={ticket.status as TicketStatus} />
                  </div>
                  
                  {/* Time */}
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: false })}
                    </span>
                  </div>
                  
                  {/* Arrow */}
                  <div className="w-8 shrink-0 flex justify-end">
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#6f8551] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pending Queue */}
        <div>
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
              Pending Queue ({unassigned?.length ?? 0})
            </span>
          </div>
          
          {unassigned === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#6f8551]" />
            </div>
          ) : unassigned.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="h-8 w-8 mb-2 opacity-30" />
              <span className="text-sm">
                {channelFilter === "all" ? "No pending tickets" : `No ${channelFilter} tickets`}
              </span>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {unassigned.map((ticket) => (
                <Link
                  key={ticket._id}
                  href={`/rep/inbox/${ticket._id}`}
                  className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                >
                  {/* Channel icon */}
                  <div className="w-8 shrink-0">
                    {ticket.channel === "chat" && <MessageCircle className="h-4 w-4 text-gray-400" />}
                    {ticket.channel === "call" && <Phone className="h-4 w-4 text-gray-400" />}
                    {ticket.channel === "email" && <Mail className="h-4 w-4 text-gray-400" />}
                  </div>
                  
                  {/* Priority dot */}
                  <div className="w-4 shrink-0">
                    <span className={cn("w-2 h-2 rounded-full inline-block", priorityConfig[ticket.priority].dot)} />
                  </div>
                  
                  {/* Subject */}
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-sm font-medium text-[#2D3E2F] truncate block">{ticket.subject}</span>
                  </div>
                  
                  {/* Status */}
                  <div className="w-24 shrink-0">
                    <TicketStatusBadge status={ticket.status as TicketStatus} />
                  </div>
                  
                  {/* Time */}
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: false })}
                    </span>
                  </div>
                  
                  {/* Accept button */}
                  <div className="w-16 shrink-0 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleAccept(ticket._id, e)}
                      disabled={acceptingId === ticket._id}
                      className="h-5 text-[10px] px-2 border-[#6f8551]/30 text-[#6f8551] hover:bg-[#6f8551]/10 hover:border-[#6f8551]"
                    >
                      {acceptingId === ticket._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Accept"
                      )}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
