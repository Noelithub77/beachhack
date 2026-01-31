"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthStore } from "@/stores/auth-store";
import { Sparkles, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
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
import { formatDistanceToNow } from "date-fns";

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

  // load existing messages from convex
  const convexMessages =
    useQuery(api.functions.messages.listByConversation, {
      conversationId,
    }) || [];

  const {
    messages: aiMessages,
    sendMessage,
    status,
    stop,
  } = useChat({
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

  // merge convex messages and AI messages
  const allMessages = useMemo(() => {
    const merged = [...convexMessages];

    // add AI SDK messages that aren't in convex yet (temporary state during streaming)
    aiMessages.forEach((aiMsg) => {
      const text = getMessageText(aiMsg);
      // only add if it's a user message or actively streaming
      if (
        aiMsg.role === "user" ||
        (aiMsg.role === "assistant" && status === "streaming")
      ) {
        // check if not already in convex
        const exists = convexMessages.some(
          (cm) =>
            cm.content === text &&
            cm.senderType === (aiMsg.role === "assistant" ? "ai" : "customer"),
        );
        if (!exists && text) {
          merged.push({
            _id: aiMsg.id as Id<"messages">,
            _creationTime: Date.now(),
            conversationId,
            senderId: user?.id as Id<"users">,
            senderType: aiMsg.role === "assistant" ? "ai" : "customer",
            content: text,
            createdAt: Date.now(),
          });
        }
      }
    });

    return merged.sort((a, b) => a.createdAt - b.createdAt);
  }, [convexMessages, aiMessages, status, conversationId, user?.id]);

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
          {allMessages.length === 0 ? (
            <ConversationEmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="Hi! I'm SAGE"
              description="Your AI support assistant. How can I help you today?"
            />
          ) : (
            allMessages.map((msg) => {
              const isAi = msg.senderType === "ai";
              const isSystem = msg.senderType === "system";
              const isCustomer = msg.senderType === "customer";

              return (
                <Message key={msg._id} from={isCustomer ? "user" : "assistant"}>
                  {isSystem ? (
                    <div className="flex justify-center my-2">
                      <div className="bg-muted px-3 py-1.5 rounded-full text-xs text-muted-foreground italic">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      {isAi && (
                        <div className="shrink-0 rounded-full bg-primary/10 p-2">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <MessageContent
                        className={cn(
                          isCustomer && "bg-primary text-primary-foreground",
                        )}
                      >
                        {isAi ? (
                          <MessageResponse>{msg.content}</MessageResponse>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isCustomer
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </MessageContent>
                      {isCustomer && (
                        <div className="shrink-0 rounded-full bg-muted p-2">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )}
                </Message>
              );
            })
          )}
          {isLoading &&
            allMessages[allMessages.length - 1]?.senderType === "customer" && (
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
