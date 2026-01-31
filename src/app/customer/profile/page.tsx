"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronRight, LogOut } from "lucide-react";

export default function CustomerProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* user info */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-lg text-primary">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-lg font-medium">John Doe</p>
            <p className="text-sm text-muted-foreground">customer@coco.com</p>
          </div>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </CardContent>
      </Card>

      {/* preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Push Notifications</Label>
            <Switch id="notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-updates">Email Updates</Label>
            <Switch id="email-updates" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="context-sharing">Cross-Vendor Context</Label>
            <Switch id="context-sharing" />
          </div>
        </CardContent>
      </Card>

      {/* privacy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-between">
            View stored context data
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-between text-destructive hover:text-destructive"
          >
            Delete my data
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* sign out */}
      <Button variant="outline" className="w-full gap-2 text-muted-foreground">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
