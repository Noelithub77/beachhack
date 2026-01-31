"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import {
  Brain,
  Sparkles,
  MessageCircle,
  Clock,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MemoryNode {
  id: string;
  label: string;
  type: "topic" | "preference" | "interaction" | "insight";
  connections: number;
}

// animated dots for the graph visualization
const AnimatedDot = ({
  delay,
  size,
  className,
}: {
  delay: number;
  size: number;
  className?: string;
}) => (
  <div
    className={cn(
      "absolute rounded-full bg-primary/30 animate-pulse",
      className,
    )}
    style={{
      width: size,
      height: size,
      animationDelay: `${delay}ms`,
    }}
  />
);

// connection lines between nodes
const ConnectionLine = ({
  from,
  to,
  delay,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay: number;
}) => {
  const length = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2),
  );
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  return (
    <div
      className="absolute h-[1px] origin-left animate-pulse"
      style={{
        left: from.x,
        top: from.y,
        width: length,
        transform: `rotate(${angle}deg)`,
        background:
          "linear-gradient(90deg, transparent, var(--primary) 50%, transparent)",
        opacity: 0.3,
        animationDelay: `${delay}ms`,
      }}
    />
  );
};

export function MemoryPreview() {
  const { user } = useAuthStore();
  const [animationStep, setAnimationStep] = useState(0);

  // animated step through the visualization
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // mock memory nodes
  const memoryNodes: MemoryNode[] = [
    {
      id: "1",
      label: "Support preferences",
      type: "preference",
      connections: 3,
    },
    {
      id: "2",
      label: "Past conversations",
      type: "interaction",
      connections: 5,
    },
    { id: "3", label: "Quick resolution", type: "insight", connections: 2 },
    { id: "4", label: "Product feedback", type: "topic", connections: 4 },
  ];

  const typeIcons = {
    topic: Tag,
    preference: Sparkles,
    interaction: MessageCircle,
    insight: TrendingUp,
  };

  const typeColors = {
    topic: "bg-blue-500/20 text-blue-500",
    preference: "bg-purple-500/20 text-purple-500",
    interaction: "bg-green-500/20 text-green-500",
    insight: "bg-amber-500/20 text-amber-500",
  };

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4 text-primary" />
          SAGE Memory
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            Personalized just for you
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* visualization */}
        <div className="relative h-32 mb-4 rounded-lg bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
          {/* center brain node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative rounded-full bg-primary/20 p-3">
                <Brain className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          {/* animated connection lines */}
          <ConnectionLine
            from={{ x: 80, y: 64 }}
            to={{ x: 140, y: 64 }}
            delay={0}
          />
          <ConnectionLine
            from={{ x: 180, y: 64 }}
            to={{ x: 240, y: 64 }}
            delay={300}
          />
          <ConnectionLine
            from={{ x: 160, y: 40 }}
            to={{ x: 160, y: 88 }}
            delay={600}
          />

          {/* floating nodes */}
          <AnimatedDot delay={0} size={8} className="left-[15%] top-[30%]" />
          <AnimatedDot delay={200} size={6} className="left-[25%] top-[60%]" />
          <AnimatedDot delay={400} size={10} className="left-[75%] top-[25%]" />
          <AnimatedDot delay={600} size={6} className="left-[80%] top-[65%]" />
          <AnimatedDot delay={100} size={8} className="left-[45%] top-[15%]" />
          <AnimatedDot delay={500} size={7} className="left-[55%] top-[80%]" />
        </div>

        {/* memory categories */}
        <div className="grid grid-cols-2 gap-2">
          {memoryNodes.map((node, i) => {
            const Icon = typeIcons[node.type];
            const isActive = animationStep === i;
            return (
              <div
                key={node.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300",
                  typeColors[node.type],
                  isActive && "ring-2 ring-primary/30 scale-[1.02]",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-medium truncate">
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated in real-time
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Active
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
