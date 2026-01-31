"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Inbox, Clock, CheckCircle, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/stores/auth-store";
import { TicketCard } from "@/components/tickets/ticket-card";
import { Id } from "../../../../convex/_generated/dataModel";
import { TicketStatus } from "@/components/tickets/ticket-status-badge";

export default function RepInbox() {
  const { user } = useAuthStore();

  const unassigned = useQuery(
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

  const stats = [
    {
      label: "In Queue",
      value: unassigned?.length ?? 0,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="text-muted-foreground">
            Manage incoming support tickets
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
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
                  />
                ))}
            </div>
          )}
        </section>
      )}

      {/* queue */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Pending Tickets</h2>
        {unassigned === undefined ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : unassigned.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending tickets in queue
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
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
