"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AIContextPanelProps {
  ticketId: Id<"tickets">;
  ticketSubject: string;
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
}: AIContextPanelProps) {
  const context = useQuery(api.functions.context.getByTicket, { ticketId });
  const [justUpdated, setJustUpdated] = useState(false);
  const [prevVersion, setPrevVersion] = useState(0);

  useEffect(() => {
    if (context && context.version > prevVersion) {
      if (prevVersion !== 0) {
        setJustUpdated(true);
        const timer = setTimeout(() => setJustUpdated(false), 3000);
        return () => clearTimeout(timer);
      }
      setPrevVersion(context.version);
    }
  }, [context?.version, prevVersion]);

  if (context === undefined) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        <div className="h-20 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!context) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="pb-3 px-0">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            AI Context
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="rounded-lg border border-dashed p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              Waiting for enough conversation context to generate insights...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="pb-3 px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Sparkles
              className={cn(
                "h-3.5 w-3.5 text-primary",
                justUpdated && "animate-bounce",
              )}
            />
            AI Context
            {justUpdated && (
              <Badge
                variant="outline"
                className="ml-2 h-4 px-1.5 text-[8px] bg-primary/5 text-primary border-primary/20 animate-in fade-in zoom-in duration-300"
              >
                JUST UPDATED
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Clock className="h-3 w-3" />v{context.version}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-5">
        {/* summary */}
        <div
          className={cn(
            "transition-all duration-700 p-2 rounded-lg",
            justUpdated && "bg-primary/5 shadow-inner",
          )}
        >
          <p className="text-xs leading-relaxed text-foreground/90">
            {context.summary}
          </p>
          {context.sentiment && (
            <Badge
              className={cn(
                "mt-3 text-[10px] font-medium border-none",
                sentimentColors[
                  context.sentiment as keyof typeof sentimentColors
                ],
              )}
            >
              {context.sentiment.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* confirmed facts */}
        {context.confirmedFacts.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Confirmed Facts
            </h4>
            <ul className="space-y-2">
              {context.confirmedFacts.map((fact, i) => (
                <li
                  key={i}
                  className="text-[11px] flex items-start gap-2 text-foreground/80"
                >
                  <span className="w-1 h-1 rounded-full bg-green-500/50 mt-1.5 shrink-0" />
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* inferred signals */}
        {context.inferredSignals.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Lightbulb className="h-3 w-3 text-yellow-500" />
              AI Signals
            </h4>
            <ul className="space-y-2">
              {context.inferredSignals.map((signal, i) => (
                <li
                  key={i}
                  className="text-[11px] flex items-start gap-2 text-foreground/80 italic"
                >
                  <span className="w-1 h-1 rounded-full bg-yellow-500/50 mt-1.5 shrink-0" />
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* unknowns */}
        {context.unknowns.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              <HelpCircle className="h-3 w-3 text-blue-500" />
              Information Needed
            </h4>
            <ul className="space-y-2">
              {context.unknowns.map((unknown, i) => (
                <li
                  key={i}
                  className="text-[11px] flex items-start gap-2 text-foreground/80"
                >
                  <span className="text-blue-500 mt-[-1px] shrink-0 font-bold">
                    ?
                  </span>
                  {unknown}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
