"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const roleLabels: Record<string, string> = {
  rep_l1: "L1 Support",
  rep_l2: "L2 Support",
  rep_l3: "L3 Support",
};

export default function RepTeam() {
  const { user } = useAuthStore();

  const teamMembers = useQuery(
    api.functions.users.listTeamMembers,
    user?.vendorId ? { vendorId: user.vendorId as Id<"vendors"> } : {},
  );

  if (teamMembers === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-muted-foreground">
          Your team members and their status
        </p>
      </div>

      {teamMembers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No team members found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className={member.id === user?.id ? "border-primary/50" : ""}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                      member.isActive ? "bg-sage-500" : "bg-muted"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {member.name}
                    {member.id === user?.id && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {roleLabels[member.role] || member.role}
                  </p>
                </div>
                <Badge variant="secondary">
                  {member.ticketCount}{" "}
                  {member.ticketCount === 1 ? "ticket" : "tickets"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
