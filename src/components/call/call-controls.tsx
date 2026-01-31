"use client";

import { useCallStore } from "@/stores/call-store";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallControlsProps {
  onHangUp: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

export function CallControls({
  onHangUp,
  onToggleMute,
  onToggleSpeaker,
}: CallControlsProps) {
  const { isMuted, isSpeakerOn } = useCallStore();

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

      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full"
        onClick={onToggleSpeaker}
      >
        {isSpeakerOn ? (
          <Volume2 className="h-6 w-6" />
        ) : (
          <VolumeX className="h-6 w-6 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
