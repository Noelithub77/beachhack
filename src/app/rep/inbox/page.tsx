"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Inbox,
  Clock,
  CheckCircle,
  Loader2,
  MessageCircle,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/stores/auth-store";
import { TicketCard } from "@/components/tickets/ticket-card";
import { Id } from "../../../../convex/_generated/dataModel";
import { TicketStatus } from "@/components/tickets/ticket-status-badge";

type ChannelFilter = "all" | "chat" | "call" | "email" | "docs";

export default function RepInbox() {
  const { user } = useAuthStore();
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");

  // fetch unassigned tickets with channel filter
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

  // fetch all unassigned for counts
  const allUnassigned = useQuery(
    api.functions.tickets.listUnassigned,
    user?.vendorId ? { vendorId: user.vendorId as Id<"vendors"> } : {},
  );

  const assigned = useQuery(
    api.functions.tickets.listByRep,
    user?.id ? { repId: user.id as Id<"users"> } : "skip",
  );

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

  // channel counts
  const chatCount =
    allUnassigned?.filter((t) => t.channel === "chat").length ?? 0;
  const callCount =
    allUnassigned?.filter((t) => t.channel === "call").length ?? 0;
  const emailCount =
    allUnassigned?.filter((t) => t.channel === "email").length ?? 0;

  const stats = [
    {
      label: "In Queue",
      value: allUnassigned?.length ?? 0,
      icon: Inbox,
      color: "text-primary",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "text-sand",
    },
    {
      label: "Resolved Today",
      value: resolvedToday,
      icon: CheckCircle,
      color: "text-sage-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-muted-foreground">Manage incoming support tickets</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* my tickets */}
      {assigned && assigned.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">My Assigned Tickets</h2>
          {assigned.filter(
            (t) => t.status !== "closed" && t.status !== "resolved",
          ).length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No active assigned tickets
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {assigned
                .filter((t) => t.status !== "closed" && t.status !== "resolved")
                .map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    id={ticket._id}
                    subject={ticket.subject}
                    status={ticket.status as TicketStatus}
                    priority={ticket.priority}
                    updatedAt={ticket.updatedAt}
                    href={`/rep/inbox/${ticket._id}`}
                    channel={ticket.channel}
                  />
                ))}
            </div>
          )}
        </section>
      )}

      {/* queue with tabs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Pending Tickets</h2>
          <Tabs
            value={channelFilter}
            onValueChange={(v) => setChannelFilter(v as ChannelFilter)}
          >
            <TabsList>
              <TabsTrigger value="all">
                All ({allUnassigned?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                {chatCount}
              </TabsTrigger>
              <TabsTrigger value="call" className="gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {callCount}
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {emailCount}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {unassigned === undefined ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : unassigned.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {channelFilter === "all"
                ? "No pending tickets in queue"
                : `No ${channelFilter} tickets in queue`}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {unassigned.map((ticket) => (
              <TicketCard
                key={ticket._id}
                id={ticket._id}
                subject={ticket.subject}
                status={ticket.status as TicketStatus}
                priority={ticket.priority}
                updatedAt={ticket.updatedAt}
                href={`/rep/inbox/${ticket._id}`}
                channel={ticket.channel}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
