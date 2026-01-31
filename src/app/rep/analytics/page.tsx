"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { formatDistanceToNow } from "date-fns";

export default function RepAnalytics() {
  const { user } = useAuthStore();

  const performance = useQuery(
    api.functions.analytics.repPerformance,
    user?.id ? { repId: user.id as Id<"users"> } : "skip",
  );

  if (performance === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    {
      label: "Tickets Resolved",
      value: performance.resolved.toString(),
      subValue: `${performance.resolvedToday} today`,
      trend: performance.resolved > 0 ? "up" : "neutral",
    },
    {
      label: "Avg Resolution Time",
      value: `${performance.avgResolutionMinutes}m`,
      subValue: "per ticket",
      trend: performance.avgResolutionMinutes < 30 ? "down" : "up",
    },
    {
      label: "Customer Rating",
      value: performance.avgRating > 0 ? performance.avgRating.toFixed(1) : "-",
      subValue: "out of 5",
      trend: performance.avgRating >= 4 ? "up" : "neutral",
    },
    {
      label: "Escalation Rate",
      value: `${performance.escalationRate}%`,
      subValue: "of tickets",
      trend: performance.escalationRate < 10 ? "down" : "up",
    },
  ];

  const statusLabels: Record<string, string> = {
    resolved: "Resolved",
    closed: "Closed",
    escalated: "Escalated",
    in_progress: "Working",
    assigned: "Assigned",
  };

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
                    stat.trend === "up"
                      ? "text-primary"
                      : stat.trend === "down"
                        ? "text-sage-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {stat.trend === "up" && (
                    <TrendingUp className="mr-0.5 h-3 w-3" />
                  )}
                  {stat.trend === "down" && (
                    <TrendingDown className="mr-0.5 h-3 w-3" />
                  )}
                  {stat.subValue}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* activity & summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {performance.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              performance.recentActivity.map((item) => (
                <div
                  key={item.ticketId}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    {item.status === "resolved" || item.status === "closed" ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-sand" />
                    )}
                    <span className="text-sm">
                      <span className="font-medium">
                        {statusLabels[item.status] || item.status}
                      </span>{" "}
                      {item.subject.slice(0, 30)}
                      {item.subject.length > 30 ? "..." : ""}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Assigned</span>
              <span className="font-medium">{performance.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Resolved</span>
              <span className="font-medium">{performance.resolved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Resolution</span>
              <span className="font-medium">
                {performance.avgResolutionMinutes} min
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rating</span>
              <span className="font-medium">
                {performance.avgRating > 0
                  ? `${performance.avgRating}/5`
                  : "No ratings yet"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
