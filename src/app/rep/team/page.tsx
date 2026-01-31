"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const teamMembers = [
  { name: "Sarah Johnson", role: "L1 Support", online: true, tickets: 12 },
  { name: "Mike Chen", role: "L1 Support", online: true, tickets: 8 },
  { name: "Emily Davis", role: "L2 Support", online: false, tickets: 5 },
  { name: "Alex Kumar", role: "L1 Support", online: true, tickets: 15 },
];

export default function RepTeam() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-muted-foreground">
          Your team members and their status
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {teamMembers.map((member) => (
          <Card key={member.name}>
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
                    member.online ? "bg-sage-500" : "bg-muted"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
              <Badge variant="secondary">{member.tickets} tickets</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
