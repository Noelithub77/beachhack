"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";

const companyMetrics = [
  { label: "Total Tickets", value: "12,847", change: "+8%", trend: "up" },
  { label: "Resolution Rate", value: "94.2%", change: "+2.1%", trend: "up" },
  { label: "Avg Handle Time", value: "14.5m", change: "-2.3m", trend: "down" },
  { label: "CSAT Score", value: "4.6", change: "+0.3", trend: "up" },
];

const levelBreakdown = [
  { level: "L1 Support", resolved: 8542, escalated: 1203, rate: "87%" },
  { level: "L2 Support", resolved: 2105, escalated: 312, rate: "87%" },
  { level: "L3 Support", resolved: 385, escalated: 12, rate: "97%" },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">
          Company-wide performance insights
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          {/* metrics */}
          <div className="grid grid-cols-4 gap-4">
            {companyMetrics.map((metric) => (
              <Card key={metric.label}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">
                      {metric.value}
                    </span>
                    <span
                      className={`flex items-center text-sm ${
                        metric.trend === "up" ? "text-primary" : "text-sage-500"
                      }`}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp className="mr-0.5 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-0.5 h-3 w-3" />
                      )}
                      {metric.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* level breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Support Level Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium">Resolved</th>
                    <th className="pb-3 font-medium">Escalated</th>
                    <th className="pb-3 font-medium">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {levelBreakdown.map((row) => (
                    <tr key={row.level} className="border-b last:border-0">
                      <td className="py-3 font-medium">{row.level}</td>
                      <td className="py-3">{row.resolved.toLocaleString()}</td>
                      <td className="py-3">{row.escalated.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {row.rate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="pt-4">
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">
                Team analytics coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="pt-4">
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">
                Sentiment analysis coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
