"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallControlsProps {
  isMuted: boolean;
  onHangUp: () => void;
  onToggleMute: () => void;
}

export function CallControls({
  isMuted,
  onHangUp,
  onToggleMute,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full"
        onClick={onToggleMute}
      >
        {isMuted ? (
          <MicOff className="h-6 w-6 text-red-500" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>

      <Button
        variant="destructive"
        size="icon"
        className="h-16 w-16 rounded-full"
        onClick={onHangUp}
      >
        <PhoneOff className="h-7 w-7" />
      </Button>
    </div>
  );
}
