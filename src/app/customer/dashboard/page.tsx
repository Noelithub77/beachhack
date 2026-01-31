"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/stores/auth-store";
import { TicketCard } from "@/components/tickets/ticket-card";
import { Id } from "../../../../convex/_generated/dataModel";
import { TicketStatus } from "@/components/tickets/ticket-status-badge";

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const tickets = useQuery(
    api.functions.tickets.listActive,
    user?.id ? { customerId: user.id as Id<"users"> } : "skip",
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">How can we help you today?</p>
      </div>

      {/* quick help */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Get Help</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/customer/help/chat">
            <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <MessageCircle
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium">Chat</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/customer/help/call">
            <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Phone className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Call</span>
              </CardContent>
            </Card>
          </Link>
          <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <div className="rounded-full bg-sand/20 p-3">
                <Mail className="h-5 w-5 text-earth" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Email</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <div className="rounded-full bg-sand/20 p-3">
                <FileText className="h-5 w-5 text-earth" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Docs</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* active tickets */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active Tickets</h2>
          <Link href="/customer/tickets/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </Link>
        </div>

        {tickets === undefined ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8 text-center">
              <p className="text-muted-foreground">No active tickets</p>
              <p className="text-sm text-muted-foreground">
                Start a conversation to get help
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {tickets.slice(0, 3).map((ticket) => (
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
            {tickets.length > 3 && (
              <Link href="/customer/tickets" className="block">
                <Button variant="ghost" className="w-full">
                  View all {tickets.length} tickets
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* vendor selector hint */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your Vendors</h2>
        <Link href="/customer/vendors">
          <Card className="cursor-pointer transition-all hover:shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Select a vendor to view or create support tickets
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
