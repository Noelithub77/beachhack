"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Users, Circle, TicketCheck, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const roleLabels: Record<string, string> = {
  rep_l1: "L1 Support",
  rep_l2: "L2 Support",
  rep_l3: "L3 Support",
};

const roleColors: Record<string, string> = {
  rep_l1: "bg-primary/10 text-primary hover:bg-primary/20",
  rep_l2: "bg-[#c3a789]/20 text-[#7b5e45] hover:bg-[#c3a789]/30", // Sand/Earth
  rep_l3: "bg-[#7b5e45]/10 text-[#7b5e45] hover:bg-[#7b5e45]/20", // Earth
};

export default function RepTeam() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const teamMembers = useQuery(
    api.functions.users.listTeamMembers,
    user?.vendorId ? { vendorId: user.vendorId as Id<"vendors"> } : {},
  );

  const filteredMembers = useMemo(() => {
    if (!teamMembers) return [];

    // Normalize query
    const query = searchQuery.toLowerCase().trim();
    if (!query) return teamMembers;

    return teamMembers.filter((member) =>
      member.name.toLowerCase().includes(query) ||
      (roleLabels[member.role] || member.role).toLowerCase().includes(query)
    );
  }, [teamMembers, searchQuery]);

  const stats = useMemo(() => {
    if (!teamMembers) return { total: 0, online: 0, busy: 0 };
    return {
      total: teamMembers.length,
      online: teamMembers.filter(m => m.isActive).length,
      busy: teamMembers.filter(m => m.ticketCount > 0).length,
    };
  }, [teamMembers]);

  if (teamMembers === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 p-1">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Overview</h1>
          <p className="text-muted-foreground mt-1">
            Manage your support team and view real-time status.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-card border rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
              <p className="font-bold text-lg leading-none">{stats.total}</p>
            </div>
          </div>
          <div className="bg-card border rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-primary/10 rounded-full">
              <Circle className="w-4 h-4 text-primary fill-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Online</p>
              <p className="font-bold text-lg leading-none text-primary">{stats.online}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          placeholder="Search team members by name or role..."
          className="pl-10 pr-10 h-10 bg-background/50 backdrop-blur-sm transition-all focus:bg-background border-primary/20 focus-visible:ring-primary/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Team Grid */}
      {filteredMembers.length === 0 ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center bg-muted/40 rounded-3xl border-2 border-dashed"
        >
          <div className="p-4 bg-muted rounded-full mb-4">
            <Users className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No team members found</p>
          <p className="text-muted-foreground">Try adjusting your search query.</p>
        </motion.div>
      ) : (
        <motion.div
          key={searchQuery || "grid"} // Force remount if query changes significantly, ensuring animations play or layout resets
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredMembers.map((member) => (
            <motion.div key={member.id} variants={item}>
              <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${member.id === user?.id ? "border-primary/50 ring-1 ring-primary/20" : "hover:border-primary/20"
                }`}>
                {/* Active Indicator Strip */}
                {member.isActive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                )}

                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                        <AvatarFallback className={`text-base font-semibold ${member.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {member.isActive ? (
                        <div className="absolute -bottom-1 -right-1">
                          <span className="relative flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/80 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary border-2 border-background"></span>
                          </span>
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-muted-foreground/30 border-2 border-background" />
                      )}
                    </div>

                    <Badge variant="outline" className={`${roleColors[member.role] || "bg-muted"} border-0 font-medium`}>
                      {roleLabels[member.role] || member.role}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                      {member.name}
                      {member.id === user?.id && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] tracking-wide">YOU</Badge>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                      {member.isActive ? (
                        <span className="text-primary flex items-center gap-1.5">
                          Active Now
                        </span>
                      ) : "Offline"}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t flex items-center justify-between group-hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TicketCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Assigned Tickets</span>
                    </div>
                    <span className={`text-lg font-bold ${member.ticketCount > 0 ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {member.ticketCount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
