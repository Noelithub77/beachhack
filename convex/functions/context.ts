import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// create or update context summary
export const upsert = mutation({
    args: {
        ticketId: v.id("tickets"),
        summary: v.string(),
        confirmedFacts: v.array(v.string()),
        inferredSignals: v.array(v.string()),
        unknowns: v.array(v.string()),
        actionsTaken: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("contextSummaries")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .first();

        const now = Date.now();
        if (existing) {
            // append to existing
            await ctx.db.patch(existing._id, {
                summary: args.summary,
                confirmedFacts: [...existing.confirmedFacts, ...args.confirmedFacts],
                inferredSignals: [...existing.inferredSignals, ...args.inferredSignals],
                unknowns: args.unknowns,
                actionsTaken: [...existing.actionsTaken, ...args.actionsTaken],
                updatedAt: now,
            });
            return { success: true, id: existing._id };
        }

        const id = await ctx.db.insert("contextSummaries", {
            ticketId: args.ticketId,
            summary: args.summary,
            confirmedFacts: args.confirmedFacts,
            inferredSignals: args.inferredSignals,
            unknowns: args.unknowns,
            actionsTaken: args.actionsTaken,
            createdAt: now,
            updatedAt: now,
        });
        return { success: true, id };
    },
});

// get context for ticket
export const getByTicket = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("contextSummaries")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .first();
    },
});
