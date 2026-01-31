"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  ArrowLeft,
  Loader2,
  Sparkles,
  UserRound,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  Clock,
  Calendar,
  FileIcon,
  ScrollText,
  Activity,
} from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useAuthStore } from "@/stores/auth-store";
import { TicketCard } from "@/components/tickets/ticket-card";
import { TicketStatus } from "@/components/tickets/ticket-status-badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function VendorDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const vendorId = params.vendorId as string;
  const mode = searchParams.get("mode") as "ai" | "human" | null;

  // Fetch vendor details
  const vendor = useQuery(api.functions.vendors.getById, {
    id: vendorId as Id<"vendors">,
  });

  // Fetch user's tickets for this vendor
  const tickets = useQuery(
    api.functions.tickets.listByVendorAndCustomer,
    user?.id
      ? {
          vendorId: vendorId as Id<"vendors">,
          customerId: user.id as Id<"users">,
        }
      : "skip"
  );

  if (vendor === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (vendor === null) {
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
        onClick={() => router.push(mode ? `/customer/vendors?mode=${mode}` : "/customer/vendors")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vendors
      </Button>

      {/* Vendor Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-primary/10 p-4">
          <Building2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{vendor.name}</h1>
          <p className="text-muted-foreground">Active vendor</p>
        </div>
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
              onClick={() => router.push(`/customer/vendors/${vendorId}?mode=human`)}
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
                To connect you with the right support representative, we need some information about your issue.
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
              onClick={() => router.push(`/customer/vendors/${vendorId}?mode=ai`)}
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
              onClick={() => router.push(`/customer/vendors/${vendorId}?mode=ai`)}
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
              onClick={() => router.push(`/customer/vendors/${vendorId}?mode=human`)}
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
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Activity Timeline</p>
              <p className="text-sm text-muted-foreground">
                Your interaction history with {vendor.name}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendor Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{vendor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contracts & SLAs</CardTitle>
                <CardDescription>
                  Service level agreements and contracts
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 text-center text-muted-foreground">
                <FileIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No documents available</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
