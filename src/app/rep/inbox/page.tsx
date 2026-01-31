"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, Clock, CheckCircle, ArrowUpRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "In Queue", value: "12", icon: Inbox, color: "text-primary" },
  { label: "In Progress", value: "5", icon: Clock, color: "text-sand" },
  {
    label: "Resolved Today",
    value: "23",
    icon: CheckCircle,
    color: "text-sage-500",
  },
];

export default function RepInbox() {
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

      {/* ticket list */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Pending Tickets</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Order not delivered</span>
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      Urgent
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer: John Doe • Acme Corp
                  </p>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-sm">2m ago</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
