"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, History, X } from "lucide-react";

interface Suggestion {
  id: string;
  text: string;
  memories: string[];
  timestamp: number;
}

interface RepSuggestionPanelProps {
  transcript: string;
  userId?: string;
  vendorName?: string;
  isActive: boolean;
}

export function RepSuggestionPanel({
  transcript,
  userId,
  vendorName,
  isActive,
}: RepSuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const lastProcessedRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // fetch suggestion when transcript changes
  useEffect(() => {
    if (!isActive || !transcript) return;

    // debounce and only process new content
    const words = transcript.trim().split(/\s+/);
    if (words.length < 5) return;

    // only trigger on substantial new content
    if (transcript === lastProcessedRef.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // extract last ~50 words for context
      const recentText = words.slice(-50).join(" ");
      lastProcessedRef.current = transcript;

      setLoading(true);
      try {
        const res = await fetch("/api/voice/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: recentText,
            userId,
            vendorName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.suggestion) {
            const newSuggestion: Suggestion = {
              id: Date.now().toString(),
              text: data.suggestion,
              memories: data.memories || [],
              timestamp: Date.now(),
            };
            setSuggestions((prev) => [newSuggestion, ...prev.slice(0, 4)]);
          }
        }
      } catch (err) {
        console.error("[Suggestion] Error:", err);
      } finally {
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(debounceRef.current);
  }, [transcript, userId, vendorName, isActive]);

  const dismissSuggestion = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visibleSuggestions = suggestions.filter((s) => !dismissed.has(s.id));

  if (!isActive) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          AI Suggestions
          {loading && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleSuggestions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Suggestions will appear based on conversation
          </p>
        ) : (
          visibleSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="relative p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => dismissSuggestion(suggestion.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              <p className="text-sm pr-6">{suggestion.text}</p>
              {suggestion.memories.length > 0 && (
                <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <History className="h-3 w-3" />
                    From history:
                  </div>
                  {suggestion.memories.slice(0, 1).map((mem, i) => (
                    <p
                      key={i}
                      className="text-xs text-muted-foreground line-clamp-2"
                    >
                      {mem}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
