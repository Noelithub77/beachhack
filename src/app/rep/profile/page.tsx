"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, Mail, Building2, Pencil, BadgeCheck } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function RepProfile() {
  const { user, setUser } = useAuthStore();
  const updateProfile = useMutation(api.functions.users.updateProfile);

  const vendor = useQuery(
    api.functions.vendors.getById,
    user?.vendorId ? { id: user.vendorId as Id<"vendors"> } : "skip",
  );

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editPhone, setEditPhone] = useState(user?.phoneNumber ?? "");
  const [saving, setSaving] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  const roleLabel =
    user?.role === "rep_l1"
      ? "L1 Support"
      : user?.role === "rep_l2"
        ? "L2 Support"
        : user?.role === "rep_l3"
          ? "L3 Support"
          : (user?.role ?? "Representative");

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateProfile({
        userId: user.id as Id<"users">,
        name: editName || undefined,
        phoneNumber: editPhone || undefined,
      });
      setUser({ ...user, name: editName || user.name, phoneNumber: editPhone });
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
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
        <p className="text-muted-foreground">Your account information</p>
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
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium">{user.name}</p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {roleLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {user.phoneNumber || "No phone set"}
            </div>
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
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be shared with customers when you accept their
                    callback requests.
                  </p>
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

      {/* company info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Company</CardTitle>
        </CardHeader>
        <CardContent>
          {vendor ? (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2.5">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{vendor.name}</p>
                {vendor.category && (
                  <p className="text-sm text-muted-foreground">
                    {vendor.category}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No company assigned</p>
          )}
        </CardContent>
      </Card>

      {/* status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
