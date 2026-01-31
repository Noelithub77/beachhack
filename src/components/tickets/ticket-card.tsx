"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MessageCircle, Phone, Mail, FileText } from "lucide-react";
import Link from "next/link";
import { TicketStatusBadge, type TicketStatus } from "./ticket-status-badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  updatedAt: number;
  href: string;
  customerName?: string;
  vendorName?: string;
  channel?: "chat" | "call" | "email" | "docs";
  category?: string;
  aiSummary?: string;
}

const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-sand/20 text-earth",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-destructive/10 text-destructive",
};

const channelIcon: Record<string, React.ElementType> = {
  chat: MessageCircle,
  call: Phone,
  email: Mail,
  docs: FileText,
};

const channelColor: Record<string, string> = {
  chat: "text-primary",
  call: "text-green-600",
  email: "text-blue-600",
  docs: "text-orange-600",
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
  channel,
  category,
  aiSummary,
}: TicketCardProps) {
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  const ChannelIcon = channel ? channelIcon[channel] : null;

  return (
    <Link href={href}>
      <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Channel Icon */}
            {ChannelIcon && (
              <div className={cn("shrink-0", channelColor[channel!])}>
                <ChannelIcon className="h-5 w-5" />
              </div>
            )}

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
                {category && (
                  <span className="text-xs text-muted-foreground">
                    • {category}
                  </span>
                )}
              </div>
              <p className="font-medium truncate">{subject}</p>
              {aiSummary ? (
                <p className="text-sm text-muted-foreground truncate">
                  {aiSummary}
                </p>
              ) : customerName || vendorName ? (
                <p className="text-sm text-muted-foreground truncate">
                  {customerName && `${customerName}`}
                  {customerName && vendorName && " • "}
                  {vendorName && vendorName}
                </p>
              ) : null}
            </div>
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
