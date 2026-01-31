"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useAuthStore } from "@/stores/auth-store";
import { useVendorStore } from "@/stores/vendor-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import Link from "next/link";

const channelOptions = [
  { value: "chat", label: "Chat", icon: MessageCircle },
  { value: "call", label: "Call", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "docs", label: "Docs", icon: FileText },
] as const;

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-muted" },
  { value: "medium", label: "Medium", color: "bg-sand/20" },
  { value: "high", label: "High", color: "bg-orange-100" },
  { value: "urgent", label: "Urgent", color: "bg-destructive/10" },
] as const;

export default function NewTicketPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedVendorId } = useVendorStore();

  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<"chat" | "call" | "email" | "docs">(
    "chat",
  );
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [creating, setCreating] = useState(false);

  const vendors = useQuery(api.functions.vendors.list);
  const [vendorId, setVendorId] = useState<string>(selectedVendorId || "");

  const createTicket = useMutation(api.functions.tickets.create);
  const createConversation = useMutation(api.functions.conversations.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !vendorId || !subject.trim()) return;

    setCreating(true);
    try {
      const result = await createTicket({
        customerId: user.id as Id<"users">,
        vendorId: vendorId as Id<"vendors">,
        channel,
        priority,
        subject: subject.trim(),
      });

      if (result.ticketId) {
        await createConversation({
          ticketId: result.ticketId,
          channel,
        });
        router.push(`/customer/tickets/${result.ticketId}`);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/customer/tickets">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* vendor selection */}
            <div className="space-y-2">
              <Label>Vendor</Label>
              {vendors === undefined ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading vendors...
                </div>
              ) : vendors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No vendors available
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {vendors.map((v) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setVendorId(v._id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        vendorId === v._id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium">{v.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe your issue..."
                required
              />
            </div>

            {/* channel */}
            <div className="space-y-2">
              <Label>Preferred Channel</Label>
              <div className="grid grid-cols-4 gap-2">
                {channelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setChannel(opt.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                      channel === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <opt.icon className="h-5 w-5" />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="grid grid-cols-4 gap-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`p-2 rounded-lg border text-center text-sm transition-colors ${
                      priority === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={creating || !vendorId || !subject.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
