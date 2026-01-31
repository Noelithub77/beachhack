"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  { label: "Tickets Resolved", value: "127", change: "+12%", trend: "up" },
  { label: "Avg Resolution Time", value: "18m", change: "-3m", trend: "down" },
  { label: "Customer Rating", value: "4.8", change: "+0.2", trend: "up" },
  { label: "Escalation Rate", value: "8%", change: "-2%", trend: "down" },
];

const recentActivity = [
  { action: "Resolved", ticket: "TKT-1005", time: "10m ago" },
  { action: "Escalated", ticket: "TKT-1003", time: "25m ago" },
  { action: "Resolved", ticket: "TKT-1002", time: "1h ago" },
  { action: "Resolved", ticket: "TKT-0999", time: "2h ago" },
];

export default function RepAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">Your performance metrics</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{stat.value}</span>
                <span
                  className={`flex items-center text-sm ${
                    stat.trend === "up" ? "text-primary" : "text-sage-500"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-0.5 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-3 w-3" />
                  )}
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* activity & chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  {item.action === "Resolved" ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-sand" />
                  )}
                  <span className="text-sm">
                    <span className="font-medium">{item.action}</span>{" "}
                    {item.ticket}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Chart coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
