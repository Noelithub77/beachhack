"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerFeedback } from "@/components/feedback/customer-feedback";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAuthStore } from "@/stores/auth-store";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export default function CustomerChat() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const [isEnded, setIsEnded] = useState(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { userId: user?.id },
      }),
    [user?.id],
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  // extract text from message parts
  const getMessageText = (msg: (typeof messages)[0]): string => {
    if ("content" in msg && msg.content) return String(msg.content);
    return (
      msg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("") || ""
    );
  };

  // add welcome message if no messages yet
  const displayMessages: { id: string; role: string; text: string }[] =
    messages.length === 0
      ? [
          {
            id: "welcome",
            role: "assistant",
            text: "Hi! I'm SAGE, your AI support assistant. How can I help you today?",
          },
        ]
      : messages.map((m) => ({
          id: m.id,
          role: m.role,
          text: getMessageText(m) || "",
        }));

  return (
    <div className="relative flex h-[calc(100vh-8rem)] flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Link href="/customer/help">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">SAGE</p>
            <p className="text-xs text-muted-foreground">
              AI Support Assistant
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => setIsEnded(true)}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="hidden sm:inline">End Chat</span>
        </Button>
      </div>

      {/* messages */}
      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full max-w-[95%] flex-col gap-2",
              msg.role === "user" ? "ml-auto items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="rounded-lg bg-muted px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <form onSubmit={handleSubmit} className="border-t pt-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Feedback Overlay */}
      {isEnded && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <CustomerFeedback
            type="chat"
            vendorName="SAGE"
            onSubmit={(data) => {
              console.log("Chat feedback:", data);
              // TODO: persist feedback
              router.push("/customer/help");
            }}
            onSkip={() => router.push("/customer/help")}
          />
        </div>
      )}
    </div>
  );
}
