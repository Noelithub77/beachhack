"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Bot, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Transcript {
  id: string;
  speaker: "customer" | "rep" | "ai";
  text: string;
  timestamp: number;
}

interface TranscriptionPanelProps {
  transcripts: Transcript[];
  className?: string;
}

export function TranscriptionPanel({
  transcripts,
  className,
}: TranscriptionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom on new transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const getSpeakerIcon = (speaker: Transcript["speaker"]) => {
    switch (speaker) {
      case "ai":
        return <Bot className="h-4 w-4 text-primary" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSpeakerLabel = (speaker: Transcript["speaker"]) => {
    switch (speaker) {
      case "customer":
        return "You";
      case "rep":
        return "Agent";
      case "ai":
        return "SAGE";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <div className="border-b px-4 py-3 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Live Transcription</h3>
        {transcripts.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {transcripts.length} message{transcripts.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <ScrollArea className="h-56" ref={scrollRef}>
        <div className="space-y-3 p-4">
          {transcripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mb-3" />
              <p className="text-sm text-muted-foreground">Listening...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Transcription will appear here
              </p>
            </div>
          ) : (
            transcripts.map((t, index) => {
              const isLatest = index === transcripts.length - 1;
              const isAI = t.speaker === "ai";

              return (
                <div
                  key={t.id}
                  className={cn(
                    "flex gap-3 transition-opacity",
                    isLatest && "animate-in fade-in slide-in-from-bottom-2",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 p-1.5 rounded-full shrink-0",
                      isAI ? "bg-primary/10" : "bg-muted",
                    )}
                  >
                    {getSpeakerIcon(t.speaker)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-xs font-medium",
                          isAI ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {getSpeakerLabel(t.speaker)}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatTime(t.timestamp)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm mt-0.5",
                        isLatest && "font-medium",
                      )}
                    >
                      {t.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
