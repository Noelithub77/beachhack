"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const ticketStatusColor: Record<string, string> = {
  resolved: "bg-sage-500/20 text-sage-900",
  closed: "bg-muted text-muted-foreground",
};

const mockHistory = [
  {
    id: "TKT-0998",
    subject: "Account login issues",
    status: "closed",
    date: "Jan 15, 2024",
  },
  {
    id: "TKT-0892",
    subject: "Billing inquiry",
    status: "closed",
    date: "Dec 28, 2023",
  },
  {
    id: "TKT-0756",
    subject: "Feature request",
    status: "resolved",
    date: "Dec 10, 2023",
  },
  {
    id: "TKT-0654",
    subject: "Integration help",
    status: "closed",
    date: "Nov 22, 2023",
  },
];

export default function CustomerHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-muted-foreground">View your past support tickets</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tickets..." className="pl-9" />
      </div>

      <div className="space-y-3">
        {mockHistory.map((ticket) => (
          <Card
            key={ticket.id}
            className="cursor-pointer transition-all hover:shadow-soft"
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {ticket.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketStatusColor[ticket.status]}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="font-medium">{ticket.subject}</p>
                <p className="text-sm text-muted-foreground">{ticket.date}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
