"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  UserRound,
  ArrowRight,
  Bot,
  Headphones,
  Loader2,
  ChevronRight,
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
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Hero Section with Primary Actions */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            How would you like to get help today?
          </p>
        </div>

        {/* Two Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Quick Help (AI) Card */}
          <Link href="/customer/vendors?mode=ai" className="block">
            <Card className="group cursor-pointer h-full transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:scale-[1.02] bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
                <div className="rounded-2xl bg-primary/15 p-5 mb-5 group-hover:bg-primary/25 transition-colors">
                  <Sparkles className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Quick Help</h2>
                <div className="flex items-center gap-1.5 text-primary font-medium mb-3">
                  <Bot className="h-4 w-4" />
                  <span>AI-Powered</span>
                </div>
                <p className="text-muted-foreground text-sm mb-5">
                  Get instant answers from our AI assistant. Fast, smart, and available 24/7.
                </p>
                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                  <span>Start Now</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Help (Human) Card */}
          <Link href="/customer/vendors?mode=human" className="block">
            <Card className="group cursor-pointer h-full transition-all duration-300 hover:shadow-xl hover:border-sage-500/40 hover:scale-[1.02] bg-gradient-to-br from-sage-500/5 to-sage-500/10 border-sage-500/20">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
                <div className="rounded-2xl bg-sage-500/15 p-5 mb-5 group-hover:bg-sage-500/25 transition-colors">
                  <UserRound className="h-10 w-10 text-sage-700 dark:text-sage-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Talk to a Human</h2>
                <div className="flex items-center gap-1.5 text-sage-700 dark:text-sage-400 font-medium mb-3">
                  <Headphones className="h-4 w-4" />
                  <span>Personal Support</span>
                </div>
                <p className="text-muted-foreground text-sm mb-5">
                  Connect with a support representative via chat, email, or phone.
                </p>
                <div className="flex items-center gap-2 text-sage-700 dark:text-sage-400 font-medium group-hover:gap-3 transition-all">
                  <span>Get Help</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Hint text */}
        <p className="text-muted-foreground text-sm mt-6 text-center">
          Select an option above to choose your vendor and start getting help
        </p>
      </div>

      {/* Active Tickets Section - Secondary */}
      {tickets && tickets.length > 0 && (
        <section className="border-t bg-muted/30 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Active Tickets</h2>
              <Link href="/customer/tickets">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {tickets.slice(0, 2).map((ticket) => (
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
          </div>
        </section>
      )}

      {/* Loading state for tickets */}
      {tickets === undefined && (
        <section className="border-t bg-muted/30 p-6">
          <div className="max-w-3xl mx-auto flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </section>
      )}
    </div>
  );
}
