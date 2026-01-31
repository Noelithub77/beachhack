"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone } from "lucide-react";

interface CallAvatarProps {
  name: string;
  avatarUrl?: string;
  isRinging?: boolean;
}

export function CallAvatar({ name, avatarUrl, isRinging }: CallAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative flex flex-col items-center gap-4">
      {isRinging && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 animate-ping rounded-full bg-primary/20" />
        </div>
      )}
      <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <p className="text-xl font-semibold">{name}</p>
        {isRinging && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Calling...
          </p>
        )}
      </div>
    </div>
  );
}
