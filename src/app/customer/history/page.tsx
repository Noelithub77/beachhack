"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ArrowRight, Loader2, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import Link from "next/link";

const ticketStatusColor: Record<string, string> = {
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-muted text-muted-foreground",
};

export default function CustomerHistory() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const tickets = useQuery(
    api.functions.tickets.listByCustomer,
    user?.id ? { customerId: user.id as Id<"users"> } : "skip",
  );

  // filter for closed/resolved tickets
  const historyTickets = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(
      (t) => t.status === "closed" || t.status === "resolved",
    );
  }, [tickets]);

  // search filter
  const filteredTickets = useMemo(() => {
    if (!search) return historyTickets;
    const lower = search.toLowerCase();
    return historyTickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(lower) ||
        t._id.toLowerCase().includes(lower),
    );
  }, [historyTickets, search]);

  if (tickets === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-muted-foreground">View your past support tickets</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {search ? "No tickets match your search" : "No ticket history"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <Link key={ticket._id} href={`/customer/tickets/${ticket._id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-soft">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        {ticket._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketStatusColor[ticket.status] || "bg-muted"}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
