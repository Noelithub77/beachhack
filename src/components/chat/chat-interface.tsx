"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ChatInterfaceProps {
  conversationId: Id<"conversations">;
  ticketId: Id<"tickets">;
}

export function ChatInterface({
  conversationId,
  ticketId,
}: ChatInterfaceProps) {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.functions.messages.listByConversation, {
    conversationId,
  });
  const sendMessage = useMutation(api.functions.messages.send);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    try {
      const senderType = user.role === "customer" ? "customer" : "rep";
      await sendMessage({
        conversationId,
        senderId: user.id as Id<"users">,
        senderType,
        content: message.trim(),
      });
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (messages === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            const isAi = msg.senderType === "ai";
            const isSystem = msg.senderType === "system";

            return (
              <div
                key={msg._id}
                className={cn(
                  "flex",
                  isSystem
                    ? "justify-center"
                    : isOwn
                      ? "justify-end"
                      : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    isSystem && "bg-muted text-muted-foreground text-sm italic",
                    isAi &&
                      "bg-primary/10 text-foreground border border-primary/20",
                    !isSystem &&
                      !isAi &&
                      isOwn &&
                      "bg-primary text-primary-foreground",
                    !isSystem && !isAi && !isOwn && "bg-muted text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isOwn
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
