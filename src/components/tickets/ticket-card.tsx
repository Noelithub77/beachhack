"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { TicketStatusBadge, type TicketStatus } from "./ticket-status-badge";
import { formatDistanceToNow } from "date-fns";

interface TicketCardProps {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  updatedAt: number;
  href: string;
  customerName?: string;
  vendorName?: string;
}

const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-sand/20 text-earth",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-destructive/10 text-destructive",
};

export function TicketCard({
  id,
  subject,
  status,
  priority,
  updatedAt,
  href,
  customerName,
  vendorName,
}: TicketCardProps) {
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });

  return (
    <Link href={href}>
      <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">
                {id.slice(-8).toUpperCase()}
              </span>
              <TicketStatusBadge status={status} />
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[priority]}`}
              >
                {priority}
              </span>
            </div>
            <p className="font-medium truncate">{subject}</p>
            {(customerName || vendorName) && (
              <p className="text-sm text-muted-foreground truncate">
                {customerName && `${customerName}`}
                {customerName && vendorName && " • "}
                {vendorName && vendorName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground shrink-0 ml-4">
            <span className="text-sm">{timeAgo}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
