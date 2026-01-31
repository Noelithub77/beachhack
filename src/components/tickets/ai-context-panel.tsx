"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useState, useCallback } from "react";

interface ContextData {
  summary: string;
  confirmedFacts: string[];
  inferredSignals: string[];
  unknowns: string[];
  actionsTaken: string[];
  sentiment: "positive" | "neutral" | "frustrated" | "urgent";
  suggestedNextSteps: string[];
}

interface AIContextPanelProps {
  ticketId: string;
  ticketSubject: string;
  messages: { role: string; content: string }[];
}

const sentimentColors = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  frustrated:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function AIContextPanel({
  ticketId,
  ticketSubject,
  messages,
}: AIContextPanelProps) {
  const [context, setContext] = useState<ContextData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, ticketSubject }),
      });

      if (!res.ok) throw new Error("Failed to fetch context");

      const data = await res.json();
      setContext(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [messages, ticketSubject]);

  if (!context && !isLoading && !error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={fetchContext}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Context Summary
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Analyzing...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button onClick={fetchContext} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Context
          </CardTitle>
          <Button
            onClick={fetchContext}
            variant="ghost"
            size="icon"
            className="h-6 w-6"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* summary */}
        <div>
          <p className="text-sm text-muted-foreground">{context?.summary}</p>
          {context?.sentiment && (
            <Badge className={`mt-2 ${sentimentColors[context.sentiment]}`}>
              {context.sentiment}
            </Badge>
          )}
        </div>

        {/* confirmed facts */}
        {context?.confirmedFacts && context.confirmedFacts.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Confirmed Facts
            </h4>
            <ul className="space-y-1">
              {context.confirmedFacts.map((fact, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* inferred signals */}
        {context?.inferredSignals && context.inferredSignals.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Inferred Signals
            </h4>
            <ul className="space-y-1">
              {context.inferredSignals.map((signal, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* unknowns */}
        {context?.unknowns && context.unknowns.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              Needs Clarification
            </h4>
            <ul className="space-y-1">
              {context.unknowns.map((unknown, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">?</span>
                  {unknown}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* suggested next steps */}
        {context?.suggestedNextSteps &&
          context.suggestedNextSteps.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Suggested Next Steps
              </h4>
              <ul className="space-y-1">
                {context.suggestedNextSteps.map((step, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <span className="text-primary mt-0.5">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
