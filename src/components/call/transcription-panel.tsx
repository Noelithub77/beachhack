"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Bot } from "lucide-react";

export interface Transcript {
  id: string;
  speaker: "customer" | "rep" | "ai";
  text: string;
  timestamp: number;
}

interface TranscriptionPanelProps {
  transcripts: Transcript[];
}

export function TranscriptionPanel({ transcripts }: TranscriptionPanelProps) {
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

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">Live Transcription</h3>
      </div>
      <ScrollArea className="h-48">
        <div className="space-y-3 p-4">
          {transcripts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Transcription will appear here...
            </p>
          ) : (
            transcripts.map((t) => (
              <div key={t.id} className="flex gap-2">
                <div className="mt-0.5">{getSpeakerIcon(t.speaker)}</div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {getSpeakerLabel(t.speaker)}
                  </p>
                  <p className="text-sm">{t.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
