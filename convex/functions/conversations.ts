import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// create conversation for ticket
export const create = mutation({
    args: {
        ticketId: v.id("tickets"),
        channel: v.union(v.literal("chat"), v.literal("call"), v.literal("email"), v.literal("docs")),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("conversations", {
            ticketId: args.ticketId,
            channel: args.channel,
            createdAt: Date.now(),
        });
        return { success: true, conversationId: id };
    },
});

// get conversation by ticket
export const getByTicket = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .first();
    },
});

// list all conversations for ticket
export const listByTicket = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("conversations")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .collect();
    },
});
