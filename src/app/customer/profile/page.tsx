"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronRight, LogOut, Phone, Mail, Pencil } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function CustomerProfile() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const updateProfile = useMutation(api.functions.users.updateProfile);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editPhone, setEditPhone] = useState(user?.phoneNumber ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [saving, setSaving] = useState(false);

  // E.164 format validation
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // optional field
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    return e164Regex.test(phone.replace(/\s/g, ""));
  };

  const handlePhoneChange = (value: string) => {
    setEditPhone(value);
    if (value && !validatePhone(value)) {
      setPhoneError("Use E.164 format: +[country code][number]");
    } else {
      setPhoneError("");
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  const handleSave = async () => {
    if (!user?.id) return;
    if (editPhone && !validatePhone(editPhone)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }
    setSaving(true);
    try {
      // normalize phone to E.164 (remove spaces)
      const normalizedPhone = editPhone
        ? editPhone.replace(/\s/g, "")
        : undefined;
      await updateProfile({
        userId: user.id as Id<"users">,
        name: editName || undefined,
        phoneNumber: normalizedPhone,
      });
      setUser({
        ...user,
        name: editName || user.name,
        phoneNumber: normalizedPhone,
      });
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in</p>
      </div>
    );
  }

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
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-lg font-medium">{user.name}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {user.phoneNumber}
              </div>
            )}
          </div>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+12345678900"
                    className={phoneError ? "border-red-500" : ""}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    E.164 format: +[country code][number] (e.g., +12025551234)
                  </p>
                  {phoneError && (
                    <p className="text-xs text-red-500">{phoneError}</p>
                  )}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
      <Button
        variant="outline"
        className="w-full gap-2 text-muted-foreground"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
