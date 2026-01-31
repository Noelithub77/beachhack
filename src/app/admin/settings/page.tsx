"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">System configuration</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" defaultValue="COCO Support" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Support Email</Label>
              <Input id="email" defaultValue="support@coco.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="escalation-alerts">Escalation Alerts</Label>
              <Switch id="escalation-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="queue-alerts">Queue Threshold Alerts</Label>
              <Switch id="queue-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-digest">Daily Digest</Label>
              <Switch id="daily-digest" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-intake">AI Intake (SAGE)</Label>
              <Switch id="ai-intake" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-summary">Auto Context Summary</Label>
              <Switch id="auto-summary" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-ai">Voice AI (ElevenLabs)</Label>
              <Switch id="voice-ai" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Twilio</p>
                <p className="text-xs text-muted-foreground">Voice calls</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resend</p>
                <p className="text-xs text-muted-foreground">Email delivery</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
