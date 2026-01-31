"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

const ticketStatusColor: Record<string, string> = {
  created: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  waiting_for_agent: "bg-sand/20 text-earth",
  resolved: "bg-sage-500/20 text-sage-900",
};

const mockTickets = [
  {
    id: "TKT-1001",
    subject: "Payment not processing",
    status: "in_progress",
    updated: "2h ago",
  },
  {
    id: "TKT-1002",
    subject: "Order delivery delayed",
    status: "waiting_for_agent",
    updated: "1d ago",
  },
  {
    id: "TKT-1003",
    subject: "Refund request",
    status: "resolved",
    updated: "3d ago",
  },
];

export default function CustomerTickets() {
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

      <div className="space-y-3">
        {mockTickets.map((ticket) => (
          <Link key={ticket.id} href={`/customer/tickets/${ticket.id}`}>
            <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {ticket.id}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketStatusColor[ticket.status]}`}
                    >
                      {ticket.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="font-medium">{ticket.subject}</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">{ticket.updated}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
