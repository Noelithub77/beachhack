"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthStore } from "@/stores/auth-store";
import { Sparkles, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";

interface AIChatInterfaceProps {
  conversationId: Id<"conversations">;
  ticketId: Id<"tickets">;
  vendorName?: string;
  vendorContext?: string;
}

// extract text from message parts
const getMessageText = (message: {
  parts?: Array<{ type: string; text?: string }>;
}) => {
  if (!message.parts) return "";
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text || "")
    .join("");
};

export function AIChatInterface({
  conversationId,
  ticketId,
  vendorName,
  vendorContext,
}: AIChatInterfaceProps) {
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const saveMessage = useMutation(api.functions.messages.send);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        userId: user?.id,
        ticketId,
        vendorName,
        vendorContext,
      },
    }),
    onFinish: async ({ message }) => {
      // save AI response to convex
      if (message.role === "assistant" && user?.id) {
        const text = getMessageText(message);
        if (text) {
          await saveMessage({
            conversationId,
            senderId: user.id as Id<"users">,
            senderType: "ai",
            content: text,
          });
        }
      }
    },
  });

  const handleSubmit = async () => {
    if (!input.trim() || !user) return;

    const text = input;
    setInput("");

    // save user message to convex
    await saveMessage({
      conversationId,
      senderId: user.id as Id<"users">,
      senderType: "customer",
      content: text,
    });

    // submit to AI
    sendMessage({ text });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-full">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="Hi! I'm SAGE"
              description="Your AI support assistant. How can I help you today?"
            />
          ) : (
            messages.map((msg) => {
              const text = getMessageText(msg);
              return (
                <Message key={msg.id} from={msg.role}>
                  <div className="flex items-start gap-3">
                    {msg.role === "assistant" && (
                      <div className="shrink-0 rounded-full bg-primary/10 p-2">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <MessageContent
                      className={cn(
                        msg.role === "user" &&
                          "bg-primary text-primary-foreground",
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <MessageResponse>{text}</MessageResponse>
                      ) : (
                        <p className="whitespace-pre-wrap">{text}</p>
                      )}
                    </MessageContent>
                    {msg.role === "user" && (
                      <div className="shrink-0 rounded-full bg-muted p-2">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </Message>
              );
            })
          )}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader size={16} />
              <span className="text-sm">SAGE is thinking...</span>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-4">
        <PromptInput
          onSubmit={() => handleSubmit()}
          className="rounded-xl border shadow-sm"
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask SAGE anything..."
            disabled={isLoading}
          />
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit
              status={status}
              onStop={stop}
              disabled={!input.trim() && !isLoading}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
