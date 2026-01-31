"use client";

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
  currentSupportLevel?: "L1" | "L2" | "L3";
}

const priorityColor: Record<string, { bg: string; text: string; dot: string }> =
  {
    low: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
    medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    high: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
    urgent: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };

const channelIcon: Record<string, React.ElementType> = {
  chat: MessageCircle,
  call: Phone,
  email: Mail,
  docs: FileText,
};

const channelLabel: Record<string, string> = {
  chat: "Chat",
  call: "Call",
  email: "Email",
  docs: "Document",
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
  currentSupportLevel,
}: TicketCardProps) {
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  const ChannelIcon = channel ? channelIcon[channel] : null;
  const ticketId = id.slice(-8).toUpperCase();

  return (
    <Link href={href} className="block group">
      <div className="relative flex overflow-hidden rounded-lg bg-white border border-[#d4ddd0] shadow-sm hover:shadow-md hover:border-[#6f8551]/40 transition-all duration-300">
        {/* Left stub section - ticket ID */}
        <div className="relative flex flex-col items-center justify-center px-5 py-4 bg-[#f8faf6] min-w-[100px]">
          {/* Channel icon */}
          {ChannelIcon && (
            <div className="mb-2 p-1.5 rounded-lg bg-white shadow-sm border border-[#e8ede5]">
              <ChannelIcon className="h-4 w-4 text-[#6f8551]" />
            </div>
          )}

          {/* Ticket ID */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-[#6f8551]/60 uppercase tracking-widest mb-0.5">
              Ticket
            </span>
            <span className="font-mono text-sm font-bold text-[#2D3E2F]">
              #{ticketId}
            </span>
          </div>
        </div>

        {/* Dashed separator with notches */}
        <div className="relative w-0 flex items-center">
          {/* Top notch */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#f4f4f4] rounded-full border border-[#d4ddd0]" />
          {/* Dashed line */}
          <div className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-[#c4cfc0]" />
          {/* Bottom notch */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#f4f4f4] rounded-full border border-[#d4ddd0]" />
        </div>

        {/* Main content section */}
        <div className="flex-1 flex flex-col justify-center px-5 py-4 min-w-0">
          {/* Top row - badges */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <TicketStatusBadge status={status} />
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                priorityColor[priority].bg,
                priorityColor[priority].text,
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  priorityColor[priority].dot,
                )}
              />
              {priority}
            </div>
            {currentSupportLevel && (
              <div className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5">
                <span className="text-[10px] font-bold text-blue-700">
                  {currentSupportLevel}
                </span>
              </div>
            )}
            {category && (
              <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {category}
              </span>
            )}
          </div>

          {/* Subject */}
          <h3 className="font-semibold text-[#2D3E2F] truncate group-hover:text-[#6f8551] transition-colors">
            {subject}
          </h3>

          {/* Subtitle - AI summary or customer/vendor */}
          {aiSummary ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {aiSummary}
            </p>
          ) : customerName || vendorName ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {customerName && customerName}
              {customerName && vendorName && " · "}
              {vendorName && vendorName}
            </p>
          ) : channel ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              via {channelLabel[channel]}
            </p>
          ) : null}
        </div>

        {/* Right section - time and arrow */}
        <div className="flex flex-col items-end justify-center px-4 py-4 text-right shrink-0">
          <span className="text-xs text-muted-foreground mb-2">{timeAgo}</span>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6f8551]/10 group-hover:bg-[#6f8551] transition-colors">
            <ArrowRight className="h-4 w-4 text-[#6f8551] group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
