import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// submit feedback
export const submit = mutation({
    args: {
        ticketId: v.id("tickets"),
        customerId: v.id("users"),
        rating: v.number(),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("feedback", {
            ticketId: args.ticketId,
            customerId: args.customerId,
            rating: args.rating,
            comment: args.comment,
            createdAt: Date.now(),
        });
        return { success: true, feedbackId: id };
    },
});

// get feedback for ticket
export const getByTicket = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("feedback")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .first();
    },
});

// get average rating for vendor
export const getVendorStats = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const tickets = await ctx.db
            .query("tickets")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        const ticketIds = new Set(tickets.map((t) => t._id));
        const allFeedback = await ctx.db.query("feedback").collect();
        const vendorFeedback = allFeedback.filter((f) => ticketIds.has(f.ticketId));

        if (vendorFeedback.length === 0) return { avgRating: 0, count: 0 };

        const sum = vendorFeedback.reduce((acc, f) => acc + f.rating, 0);
        return { avgRating: sum / vendorFeedback.length, count: vendorFeedback.length };
    },
});
