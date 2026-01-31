"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Clock,
  User,
  Building2,
  Tag,
  AlertCircle,
  Zap,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import {
  TicketStatusBadge,
  TicketStatus,
} from "@/components/tickets/ticket-status-badge";
import { ChatInterface } from "@/components/chat/chat-interface";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Suspense } from "react";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as Id<"tickets">;
  const { user } = useAuthStore();

  const ticket = useQuery(api.functions.tickets.getWithDetails, { ticketId });
  const conversation = useQuery(api.functions.conversations.getByTicket, {
    ticketId,
  });
  const createConversation = useMutation(api.functions.conversations.create);

  const [creatingConversation, setCreatingConversation] = useState(false);

  useEffect(() => {
    if (conversation === null && ticket && !creatingConversation) {
      setCreatingConversation(true);
      createConversation({ ticketId, channel: ticket.channel }).finally(() => {
        setCreatingConversation(false);
      });
    }
  }, [
    conversation,
    ticket,
    ticketId,
    createConversation,
    creatingConversation,
  ]);

  if (ticket === undefined || conversation === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (ticket === null) {
    return (
      <div className="space-y-4">
        <Link href="/customer/tickets">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Ticket not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priorityColor: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-sand/20 text-earth",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-4">
      {/* back button */}
      <Link href="/customer/tickets">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Button>
      </Link>

      {/* ticket header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">{ticket.subject}</CardTitle>
              <p className="text-sm text-muted-foreground font-mono">
                {ticket._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="flex gap-2">
              <TicketStatusBadge status={ticket.status as TicketStatus} />
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[ticket.priority]}`}
              >
                {ticket.priority}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Created{" "}
              {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
              })}
            </div>
            {ticket.rep && (
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Assigned to {ticket.rep.name}
              </div>
            )}
            {ticket.vendor && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {ticket.vendor.name}
              </div>
            )}
          </div>

          {/* Rep callback info for call tickets */}
          {ticket.channel === "call" && ticket.rep && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {ticket.rep.name} will call you
                  </p>
                  {ticket.rep.phoneNumber ? (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Rep's number: {ticket.rep.phoneNumber}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Rep contact will be shared soon
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Intake Details if available */}
          {(ticket.category || ticket.severity || ticket.description) && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {ticket.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.description}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {ticket.category && (
                  <Badge variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {ticket.category}
                  </Badge>
                )}
                {ticket.severity && (
                  <Badge
                    variant="outline"
                    className={`gap-1 ${
                      ticket.severity === "critical"
                        ? "border-red-500 text-red-500"
                        : ticket.severity === "major"
                          ? "border-orange-500 text-orange-500"
                          : ""
                    }`}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {ticket.severity}
                  </Badge>
                )}
                {ticket.urgency && (
                  <Badge
                    variant="outline"
                    className={`gap-1 ${
                      ticket.urgency === "immediate"
                        ? "border-red-500 text-red-500"
                        : ticket.urgency === "high"
                          ? "border-orange-500 text-orange-500"
                          : ""
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    {ticket.urgency} urgency
                  </Badge>
                )}
                {ticket.preferredContact && (
                  <Badge variant="secondary" className="gap-1">
                    {ticket.preferredContact === "call" && (
                      <Phone className="h-3 w-3" />
                    )}
                    {ticket.preferredContact === "email" && (
                      <Mail className="h-3 w-3" />
                    )}
                    {ticket.preferredContact === "chat" && (
                      <MessageCircle className="h-3 w-3" />
                    )}
                    Prefers {ticket.preferredContact}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* chat section */}
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[400px]">
          {conversation ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <ChatInterface
                conversationId={conversation._id}
                ticketId={ticketId}
              />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
