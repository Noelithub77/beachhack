"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

type UserCardProps = {
  showSuperAdmin?: boolean;
  inSidebar?: boolean;
};

// Internal component that uses useSidebar (only for sidebar context)
function SidebarUserCard({ showSuperAdmin }: Omit<UserCardProps, "inSidebar">) {
  const [session, setSession] = useState<any>(null);
  const { state } = useSidebar();

  useEffect(() => {
    authClient.getSession().then(({ data }) => setSession(data));
  }, []);

  if (!session?.user) return null;

  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex justify-center p-2">
            <Avatar className="h-8 w-8 border-muted-foreground/20">
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name}
              />
              <AvatarFallback className="text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-1">
          <p className="font-semibold">{session.user.name}</p>
          <p className="text-xs text-muted-foreground">{session.user.email}</p>
          {showSuperAdmin && (
            <Badge variant="default" className="w-fit mt-1">
              Super Admin
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return <UserCardContent session={session} showSuperAdmin={showSuperAdmin} />;
}

// Shared content component
function UserCardContent({
  session,
  showSuperAdmin,
}: {
  session: any;
  showSuperAdmin?: boolean;
}) {
  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="flex items-center gap-3 w-full p-3 rounded-xl border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors">
      <Avatar className="h-9 w-9 border-muted-foreground/20 shrink-0">
        <AvatarImage src={session.user.image || ""} alt={session.user.name} />
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{session.user.name}</p>
          {showSuperAdmin && (
            <Badge
              variant="default"
              className="h-5 px-2 text-[10px] rounded-full shrink-0"
            >
              Super Admin
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
          <Mail className="h-3 w-3 opacity-70 shrink-0" />
          <p className="text-xs truncate opacity-80">{session.user.email}</p>
        </div>
      </div>
    </div>
  );
}

// Main export
export default function UserCard({
  showSuperAdmin,
  inSidebar = false,
}: UserCardProps) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    authClient.getSession().then(({ data }) => setSession(data));
  }, []);

  if (inSidebar) {
    return <SidebarUserCard showSuperAdmin={showSuperAdmin} />;
  }

  if (!session?.user) return null;
  return <UserCardContent session={session} showSuperAdmin={showSuperAdmin} />;
}
