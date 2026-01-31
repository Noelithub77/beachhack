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
import {
  TicketStatusBadge,
  TicketStatus,
} from "@/components/tickets/ticket-status-badge";
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

const channelIcon: Record<string, React.ElementType> = {
  chat: MessageCircle,
  call: Phone,
  email: Mail,
};

export default function RepInbox() {
  const { user } = useAuthStore();
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const assignTicket = useMutation(api.functions.tickets.assign);

  // fetch unassigned tickets with channel filter and rep level
  const unassigned = useQuery(
    api.functions.tickets.listUnassigned,
    user?.vendorId
      ? {
          vendorId: user.vendorId as Id<"vendors">,
          channel: channelFilter === "all" ? undefined : channelFilter,
          repRole: user.role,
        }
      : {
          channel: channelFilter === "all" ? undefined : channelFilter,
          repRole: user?.role,
        },
  );

  const allUnassigned = useQuery(
    api.functions.tickets.listUnassigned,
    user?.vendorId
      ? { vendorId: user.vendorId as Id<"vendors">, repRole: user.role }
      : { repRole: user?.role },
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
      await assignTicket({
        ticketId: ticketId as Id<"tickets">,
        repId: user.id as Id<"users">,
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const resolvedToday =
    assigned?.filter((t) => {
      if (t.status !== "resolved" || !t.resolvedAt) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return t.resolvedAt >= today.getTime();
    }).length ?? 0;

  const inProgress =
    assigned?.filter(
      (t) => t.status === "in_progress" || t.status === "assigned",
    ).length ?? 0;

  const chatCount =
    allUnassigned?.filter((t) => t.channel === "chat").length ?? 0;
  const callCount =
    allUnassigned?.filter((t) => t.channel === "call").length ?? 0;
  const emailCount =
    allUnassigned?.filter((t) => t.channel === "email").length ?? 0;

  const myActiveTickets =
    assigned?.filter((t) => t.status !== "closed" && t.status !== "resolved") ??
    [];

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

        {/* Channel tabs */}
        <Tabs
          value={channelFilter}
          onValueChange={(v) => setChannelFilter(v as ChannelFilter)}
        >
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

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* My active tickets section */}
          {myActiveTickets.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                My Active Tickets
              </h2>
              <div className="space-y-2">
                {myActiveTickets.map((ticket) => {
                  const ChannelIcon =
                    channelIcon[ticket.channel] || MessageCircle;
                  return (
                    <Link
                      key={ticket._id}
                      href={`/rep/inbox/${ticket._id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#6f8551]/40 hover:bg-gray-50/50 transition-all">
                        <div className="p-1.5 rounded bg-[#6f8551]/10">
                          <ChannelIcon className="h-3.5 w-3.5 text-[#6f8551]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2D3E2F] truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(ticket.updatedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <TicketStatusBadge
                            status={ticket.status as TicketStatus}
                          />
                          {ticket.currentSupportLevel && (
                            <div className="rounded-full bg-blue-50 border border-blue-200 px-1.5 py-0.5">
                              <span className="text-[10px] font-bold text-blue-700">
                                {ticket.currentSupportLevel}
                              </span>
                            </div>
                          )}
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              priorityConfig[ticket.priority].dot,
                            )}
                          />
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Queue section */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              {channelFilter === "all"
                ? "All Pending"
                : `${channelFilter.charAt(0).toUpperCase() + channelFilter.slice(1)} Tickets`}
            </h2>
            {unassigned === undefined ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : unassigned.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No pending tickets in queue
              </div>
            ) : (
              <div className="space-y-2">
                {unassigned.map((ticket) => {
                  const ChannelIcon =
                    channelIcon[ticket.channel] || MessageCircle;
                  const isAccepting = acceptingId === ticket._id;
                  return (
                    <Link
                      key={ticket._id}
                      href={`/rep/inbox/${ticket._id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#6f8551]/40 hover:bg-gray-50/50 transition-all">
                        <div className="p-1.5 rounded bg-gray-100">
                          <ChannelIcon className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2D3E2F] truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(ticket.updatedAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {ticket.currentSupportLevel && (
                            <div className="rounded-full bg-blue-50 border border-blue-200 px-1.5 py-0.5">
                              <span className="text-[10px] font-bold text-blue-700">
                                {ticket.currentSupportLevel}
                              </span>
                            </div>
                          )}
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              priorityConfig[ticket.priority].dot,
                            )}
                          />
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-[#6f8551] hover:bg-[#5a6d42]"
                            onClick={(e) => handleAccept(ticket._id, e)}
                            disabled={isAccepting}
                          >
                            {isAccepting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Accept
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
