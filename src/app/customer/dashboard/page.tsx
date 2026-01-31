"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Mail, FileText, Plus } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboard() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground">How can we help you today?</p>
      </div>

      {/* quick help */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Get Help</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/customer/help/chat">
            <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <MessageCircle
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium">Chat</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/customer/help/call">
            <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Phone className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Call</span>
              </CardContent>
            </Card>
          </Link>
          <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <div className="rounded-full bg-sand/20 p-3">
                <Mail className="h-5 w-5 text-earth" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Email</span>
            </CardContent>
          </Card>
          <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <div className="rounded-full bg-sand/20 p-3">
                <FileText className="h-5 w-5 text-earth" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium">Docs</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* active tickets */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active Tickets</h2>
          <Link href="/customer/tickets/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center">
            <p className="text-muted-foreground">No active tickets</p>
            <p className="text-sm text-muted-foreground">
              Start a conversation to get help
            </p>
          </CardContent>
        </Card>
      </section>

      {/* vendor selector hint */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your Vendors</h2>
        <Link href="/customer/vendors">
          <Card className="cursor-pointer transition-all hover:shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Select a vendor to view or create support tickets
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
