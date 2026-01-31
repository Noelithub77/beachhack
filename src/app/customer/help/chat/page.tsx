"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CustomerChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hi! I'm SAGE, your AI support assistant. How can I help you today?",
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");
    // AI response would stream here
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I understand you need help. Let me look into that for you...",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Link href="/customer/help">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
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
      </div>

      {/* messages */}
      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback
                className={
                  msg.role === "ai" ? "bg-primary/10 text-primary" : "bg-muted"
                }
              >
                {msg.role === "ai" ? "S" : "U"}
              </AvatarFallback>
            </Avatar>
            <Card
              className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}
            >
              <CardContent className="p-3">
                <p className="text-sm">{msg.content}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* input */}
      <div className="border-t pt-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
