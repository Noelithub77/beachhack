"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  ArrowLeft,
  Loader2,
  Sparkles,
  UserRound,
  MessageCircle,
  Phone,
  FileText,
  ArrowRight,
  Clock,
  Calendar,
  FileIcon,
  ScrollText,
  Activity,
  Star,
  ExternalLink,
  Mail,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Ticket,
} from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useAuthStore } from "@/stores/auth-store";
import { TicketCard } from "@/components/tickets/ticket-card";
import { TicketStatus } from "@/components/tickets/ticket-status-badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

export default function VendorDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const vendorId = params.vendorId as string;
  const mode = searchParams.get("mode") as "ai" | "human" | null;

  // Fetch vendor with stats
  const vendorWithStats = useQuery(
    api.functions.vendors.getWithStats,
    user?.id
      ? {
          vendorId: vendorId as Id<"vendors">,
          userId: user.id as Id<"users">,
        }
      : { vendorId: vendorId as Id<"vendors"> },
  );

  // Fetch user's tickets for this vendor
  const tickets = useQuery(
    api.functions.tickets.listByVendorAndCustomer,
    user?.id
      ? {
          vendorId: vendorId as Id<"vendors">,
          customerId: user.id as Id<"users">,
        }
      : "skip",
  );

  // Toggle favorite
  const toggleFavorite = useMutation(api.functions.vendors.toggleFavorite);

  const handleToggleFavorite = async () => {
    if (!user?.id) return;
    await toggleFavorite({
      userId: user.id as Id<"users">,
      vendorId: vendorId as Id<"vendors">,
    });
  };

  if (vendorWithStats === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (vendorWithStats === null) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Vendor not found</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/customer/vendors")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
      </div>
    );
  }

  const vendor = vendorWithStats;

  const handleAIChat = () => {
    router.push(`/customer/help/chat?vendor=${vendorId}`);
  };

  const handleAICall = () => {
    router.push(`/customer/help/call?vendor=${vendorId}`);
  };

  const handleHumanHelp = () => {
    router.push(`/customer/help/intake?vendor=${vendorId}`);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          router.push(
            mode ? `/customer/vendors?mode=${mode}` : "/customer/vendors",
          )
        }
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vendors
      </Button>

      {/* Vendor Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-4">
            <Building2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{vendor.name}</h1>
              {user?.id && (
                <button
                  onClick={handleToggleFavorite}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <Star
                    className={cn(
                      "h-5 w-5 transition-colors",
                      vendor.isFavorite
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {vendor.category && (
                <Badge variant="outline">{vendor.category}</Badge>
              )}
              <span className="text-muted-foreground">Active vendor</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {vendor.stats && (
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{vendor.stats.totalTickets}</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </div>
            <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-primary">
                {vendor.stats.openTickets}
              </p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
            <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-green-600">
                {vendor.stats.resolvedTickets}
              </p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Actions Based on Mode */}
      {mode === "ai" ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Help Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02]"
              onClick={handleAIChat}
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="rounded-xl bg-primary/10 p-4 mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">AI Chat</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Get instant help via chat
                </p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02]"
              onClick={handleAICall}
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="rounded-xl bg-primary/10 p-4 mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">AI Voice Call</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Speak with AI assistant
                </p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-sage-500/30 hover:scale-[1.02]"
              onClick={() =>
                router.push(`/customer/vendors/${vendorId}?mode=human`)
              }
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="rounded-xl bg-sage-500/10 p-4 mb-4">
                  <UserRound className="h-6 w-6 text-sage-700 dark:text-sage-400" />
                </div>
                <p className="font-semibold">Talk to Human</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Can't find what you need?
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : mode === "human" ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserRound className="h-5 w-5 text-sage-700 dark:text-sage-400" />
            Contact Support
          </h2>
          <Card className="border-sage-500/20 bg-sage-500/5">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6">
                To connect you with the right support representative, we need
                some information about your issue.
              </p>
              <Button
                size="lg"
                className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                onClick={handleHumanHelp}
              >
                Start Support Request
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground text-center">
            Need quick answers?{" "}
            <button
              className="text-primary hover:underline"
              onClick={() =>
                router.push(`/customer/vendors/${vendorId}?mode=ai`)
              }
            >
              Try AI Help instead
            </button>
          </p>
        </section>
      ) : (
        // No mode - show both options
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">How can we help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
              onClick={() =>
                router.push(`/customer/vendors/${vendorId}?mode=ai`)
              }
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="rounded-xl bg-primary/15 p-4 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="font-semibold text-lg">Quick Help (AI)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Get instant answers 24/7
                </p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-sage-500/30 hover:scale-[1.02] bg-gradient-to-br from-sage-500/5 to-sage-500/10 border-sage-500/20"
              onClick={() =>
                router.push(`/customer/vendors/${vendorId}?mode=human`)
              }
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="rounded-xl bg-sage-500/15 p-4 mb-4">
                  <UserRound className="h-8 w-8 text-sage-700 dark:text-sage-400" />
                </div>
                <p className="font-semibold text-lg">Talk to Human</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect with support
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Vendor Context Tabs */}
      <Tabs defaultValue="tickets" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">Your Tickets</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="info">Vendor Info</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4">
          {tickets === undefined ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ScrollText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">No tickets yet</p>
                <p className="text-sm text-muted-foreground">
                  Your support history with {vendor.name} will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  id={ticket._id}
                  subject={ticket.subject}
                  status={ticket.status as TicketStatus}
                  priority={ticket.priority}
                  updatedAt={ticket.updatedAt}
                  href={`/customer/tickets/${ticket._id}`}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          {tickets && tickets.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Interaction Timeline
                </CardTitle>
                <CardDescription>
                  Your recent activity with {vendor.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-6">
                    {tickets.slice(0, 10).map((ticket, index) => (
                      <div key={ticket._id} className="relative pl-8">
                        {/* Timeline dot */}
                        <div
                          className={cn(
                            "absolute left-1.5 w-3 h-3 rounded-full border-2 bg-background",
                            ticket.status === "resolved" ||
                              ticket.status === "closed"
                              ? "border-green-500"
                              : ticket.status === "in_progress" ||
                                  ticket.status === "assigned"
                                ? "border-primary"
                                : "border-muted-foreground",
                          )}
                        />

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-sm">
                              {ticket.subject}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {ticket.channel}
                              </Badge>
                              <Badge
                                variant={
                                  ticket.status === "resolved" ||
                                  ticket.status === "closed"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {ticket.status.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(ticket.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">No activity yet</p>
                <p className="text-sm text-muted-foreground">
                  Your interaction history with {vendor.name} will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Vendor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{vendor.name}</span>
                </div>
                {vendor.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="outline">{vendor.category}</Badge>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                {vendor.description && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-sm">
                      Description
                    </span>
                    <p className="mt-1 text-sm">{vendor.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vendor.supportEmail ? (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Support Email</span>
                    <a
                      href={`mailto:${vendor.supportEmail}`}
                      className="text-primary hover:underline text-sm"
                    >
                      {vendor.supportEmail}
                    </a>
                  </div>
                ) : null}
                {vendor.supportPhone ? (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Support Phone</span>
                    <a
                      href={`tel:${vendor.supportPhone}`}
                      className="text-primary hover:underline text-sm"
                    >
                      {vendor.supportPhone}
                    </a>
                  </div>
                ) : null}
                {vendor.website ? (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Website</span>
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : null}
                {!vendor.supportEmail &&
                  !vendor.supportPhone &&
                  !vendor.website && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No contact information available
                    </p>
                  )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Service Level Agreement
                </CardTitle>
                <CardDescription>
                  Support commitments and response times
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vendor.slaResponseHours ||
                vendor.contractStartDate ||
                vendor.contractEndDate ? (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {vendor.slaResponseHours && (
                      <div className="rounded-lg border p-4 text-center">
                        <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">
                          {vendor.slaResponseHours}h
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Response Time
                        </p>
                      </div>
                    )}
                    {vendor.contractStartDate && (
                      <div className="rounded-lg border p-4 text-center">
                        <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium">
                          {format(
                            new Date(vendor.contractStartDate),
                            "MMM d, yyyy",
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Contract Start
                        </p>
                      </div>
                    )}
                    {vendor.contractEndDate && (
                      <div className="rounded-lg border p-4 text-center">
                        <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium">
                          {format(
                            new Date(vendor.contractEndDate),
                            "MMM d, yyyy",
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Contract End
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No SLA information available</p>
                  </div>
                )}
                {vendor.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{vendor.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
