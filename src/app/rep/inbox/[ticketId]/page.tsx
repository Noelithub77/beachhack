"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  User,
  Clock,
  Building,
  CheckCircle,
  ArrowUpRight,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  TicketStatusBadge,
  TicketStatus,
} from "@/components/tickets/ticket-status-badge";
import { ChatInterface } from "@/components/chat/chat-interface";
import { AIContextPanel } from "@/components/tickets/ai-context-panel";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function RepTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as Id<"tickets">;
  const { user } = useAuthStore();

  const ticket = useQuery(api.functions.tickets.getWithDetails, { ticketId });
  const conversation = useQuery(api.functions.conversations.getByTicket, {
    ticketId,
  });
  const createConversation = useMutation(api.functions.conversations.create);
  const assignTicket = useMutation(api.functions.tickets.assign);
  const updateStatus = useMutation(api.functions.tickets.updateStatus);
  const escalateTicket = useMutation(api.functions.tickets.escalate);

  const [creatingConversation, setCreatingConversation] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

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

  const handleAccept = async () => {
    if (!user?.id) return;
    setLoading("accept");
    try {
      await assignTicket({ ticketId, repId: user.id as Id<"users"> });
    } finally {
      setLoading(null);
    }
  };

  const handleStartProgress = async () => {
    setLoading("progress");
    try {
      await updateStatus({ ticketId, status: "in_progress" });
    } finally {
      setLoading(null);
    }
  };

  const handleResolve = async () => {
    setLoading("resolve");
    try {
      await updateStatus({ ticketId, status: "resolved" });
    } finally {
      setLoading(null);
    }
  };

  const handleEscalate = async () => {
    setLoading("escalate");
    try {
      await escalateTicket({ ticketId });
    } finally {
      setLoading(null);
    }
  };

  const handleClose = async () => {
    setLoading("close");
    try {
      await updateStatus({ ticketId, status: "closed" });
      router.push("/rep/inbox");
    } finally {
      setLoading(null);
    }
  };

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
        <Link href="/rep/inbox">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Inbox
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

  const isAssignedToMe = ticket.assignedRepId === user?.id;
  const isUnassigned = !ticket.assignedRepId;

  return (
    <div className="space-y-4">
      {/* back button */}
      <Link href="/rep/inbox">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* main content */}
        <div className="lg:col-span-2 space-y-4">
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
                <TicketStatusBadge status={ticket.status as TicketStatus} />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                {ticket.vendor && (
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    {ticket.vendor.name}
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {isUnassigned && (
                  <Button onClick={handleAccept} disabled={loading !== null}>
                    {loading === "accept" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Accept Ticket
                  </Button>
                )}
                {isAssignedToMe && ticket.status === "assigned" && (
                  <Button
                    onClick={handleStartProgress}
                    disabled={loading !== null}
                  >
                    {loading === "progress" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Start Working
                  </Button>
                )}
                {isAssignedToMe && ticket.status === "in_progress" && (
                  <Button
                    onClick={handleResolve}
                    disabled={loading !== null}
                    variant="default"
                  >
                    {loading === "resolve" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Resolve
                  </Button>
                )}
                {isAssignedToMe &&
                  ticket.status !== "closed" &&
                  ticket.status !== "resolved" && (
                    <Button
                      onClick={handleEscalate}
                      disabled={loading !== null}
                      variant="outline"
                    >
                      {loading === "escalate" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                      )}
                      Escalate
                    </Button>
                  )}
                {ticket.status === "resolved" && (
                  <Button
                    onClick={handleClose}
                    disabled={loading !== null}
                    variant="outline"
                  >
                    {loading === "close" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Close Ticket
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* chat */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[400px]">
              {conversation ? (
                <ChatInterface
                  conversationId={conversation._id}
                  ticketId={ticketId}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* context panel */}
        <div className="space-y-4">
          {/* AI context */}
          <AIContextPanel
            ticketId={ticketId}
            ticketSubject={ticket.subject}
            messages={[]}
          />

          {/* customer info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.customer ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{ticket.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.customer.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground pt-2 border-t">
                    Language: {ticket.customer.language}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Customer info unavailable
                </p>
              )}
            </CardContent>
          </Card>

          {/* ticket details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">
                  {ticket.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span className="font-medium capitalize">{ticket.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
              {ticket.rep && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned to</span>
                  <span className="font-medium">{ticket.rep.name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
