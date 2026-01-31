import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// add ticket to queue
export const enqueue = mutation({
    args: {
        vendorId: v.id("vendors"),
        ticketId: v.id("tickets"),
        priority: v.number(),
    },
    handler: async (ctx, args) => {
        // calculate estimated wait (simple: count ahead * 5 min)
        const ahead = await ctx.db
            .query("queues")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .filter((q) => q.gte(q.field("priority"), args.priority))
            .collect();

        const id = await ctx.db.insert("queues", {
            vendorId: args.vendorId,
            ticketId: args.ticketId,
            priority: args.priority,
            enteredAt: Date.now(),
            estimatedWaitMinutes: ahead.length * 5,
        });
        return { success: true, queueId: id, position: ahead.length + 1 };
    },
});

// remove from queue
export const dequeue = mutation({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        const entry = await ctx.db
            .query("queues")
            .filter((q) => q.eq(q.field("ticketId"), args.ticketId))
            .first();
        if (entry) await ctx.db.delete(entry._id);
        return { success: true };
    },
});

// get queue for vendor
export const listByVendor = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("queues")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .order("asc")
            .collect();
    },
});

// get queue position for ticket
export const getPosition = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        const entry = await ctx.db
            .query("queues")
            .filter((q) => q.eq(q.field("ticketId"), args.ticketId))
            .first();
        if (!entry) return null;

        const ahead = await ctx.db
            .query("queues")
            .withIndex("by_vendor", (q) => q.eq("vendorId", entry.vendorId))
            .filter((q) =>
                q.or(
                    q.gt(q.field("priority"), entry.priority),
                    q.and(
                        q.eq(q.field("priority"), entry.priority),
                        q.lt(q.field("enteredAt"), entry.enteredAt)
                    )
                )
            )
            .collect();

        return { position: ahead.length + 1, estimatedWaitMinutes: entry.estimatedWaitMinutes };
    },
});
