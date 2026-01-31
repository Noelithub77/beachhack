"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Ticket,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const metrics = [
  {
    label: "Total Tickets",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Ticket,
  },
  {
    label: "Active Reps",
    value: "24",
    change: "+2",
    trend: "up",
    icon: Users,
  },
  {
    label: "Resolution Rate",
    value: "94.2%",
    change: "+3.1%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    label: "Avg Response",
    value: "4.2m",
    change: "-1.3m",
    trend: "down",
    icon: Clock,
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          System overview and quick actions
        </p>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-muted p-2">
                  <metric.icon
                    className="h-4 w-4 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    metric.trend === "up" ? "text-primary" : "text-sage-500"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-semibold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* content grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* recent activity */}
        <Card className="col-span-2">
          <CardContent className="p-4">
            <h3 className="mb-4 font-medium">Recent Activity</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      Ticket #TKT-{1000 + i} resolved
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by Sarah Johnson • Acme Corp
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {i * 5}m ago
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* quick stats */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-medium">Support Levels</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">L1 Support</span>
                <span className="font-medium">18</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">L2 Support</span>
                <span className="font-medium">5</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-1/4 rounded-full bg-sage-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">L3 Support</span>
                <span className="font-medium">1</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-[8%] rounded-full bg-sand" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
