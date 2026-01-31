import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// send message and sync to ticketContent
export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.optional(v.id("users")),
        senderType: v.union(v.literal("customer"), v.literal("rep"), v.literal("ai"), v.literal("system")),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // insert message
        const id = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.senderId,
            senderType: args.senderType,
            content: args.content,
            createdAt: now,
        });

        // get conversation to find ticketId
        const conversation = await ctx.db.get(args.conversationId);
        if (conversation) {
            // determine source based on senderType
            const source = args.senderType === "ai" ? "ai_message" as const : "chat_message" as const;
            const role = args.senderType === "customer" ? "user" as const :
                args.senderType === "ai" ? "assistant" as const : "system" as const;

            // save to ticketContent
            await ctx.db.insert("ticketContent", {
                ticketId: conversation.ticketId,
                source,
                role,
                content: args.content,
                speakerId: args.senderId,
                timestamp: now,
            });

            // count messages for this ticket
            const contentCount = await ctx.db
                .query("ticketContent")
                .withIndex("by_ticket", (q) => q.eq("ticketId", conversation.ticketId))
                .collect();

            // trigger AI processing flag after every 2 messages
            const shouldProcess = contentCount.length > 0 && contentCount.length % 2 === 0;

            return { success: true, messageId: id, shouldProcess, ticketId: conversation.ticketId };
        }

        return { success: true, messageId: id, shouldProcess: false };
    },
});

// get messages for conversation (real-time)
export const listByConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .order("asc")
            .collect();
    },
});

// get recent messages (for context)
export const getRecent = query({
    args: {
        conversationId: v.id("conversations"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .order("desc")
            .take(args.limit ?? 20);
        return messages.reverse();
    },
});
