import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// send message
export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.optional(v.id("users")),
        senderType: v.union(v.literal("customer"), v.literal("rep"), v.literal("ai"), v.literal("system")),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.senderId,
            senderType: args.senderType,
            content: args.content,
            createdAt: Date.now(),
        });
        return { success: true, messageId: id };
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
