"use client";

import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/stores/auth-store";
import { TicketCard } from "@/components/tickets/ticket-card";
import { Id } from "../../../../convex/_generated/dataModel";
import { TicketStatus } from "@/components/tickets/ticket-status-badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerTickets() {
  const { user } = useAuthStore();
  const tickets = useQuery(
    api.functions.tickets.listByCustomer,
    user?.id ? { customerId: user.id as Id<"users"> } : "skip",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Tickets</h1>
          <p className="text-muted-foreground">
            Track and manage your support requests
          </p>
        </div>
        <Link href="/customer/tickets/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      {tickets === undefined ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="text-muted-foreground">No tickets yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first support ticket to get help
            </p>
            <Link href="/customer/tickets/new">
              <Button>Create Ticket</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              id={ticket._id}
              subject={ticket.subject}
              status={ticket.status as TicketStatus}
              priority={ticket.priority}
              updatedAt={ticket.updatedAt}
              href={`/customer/tickets/${ticket._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
