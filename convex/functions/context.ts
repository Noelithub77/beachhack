import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// create or update context summary with versioning
export const upsert = mutation({
    args: {
        ticketId: v.id("tickets"),
        title: v.string(),
        summary: v.string(),
        confirmedFacts: v.array(v.string()),
        inferredSignals: v.array(v.string()),
        unknowns: v.array(v.string()),
        actionsTaken: v.array(v.string()),
        sentiment: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("contextSummaries")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .first();

        const now = Date.now();
        if (existing) {
            // increment version, merge arrays
            const newFacts = [...new Set([...existing.confirmedFacts, ...args.confirmedFacts])];
            const newSignals = [...new Set([...existing.inferredSignals, ...args.inferredSignals])];
            const newActions = [...new Set([...existing.actionsTaken, ...args.actionsTaken])];

            await ctx.db.patch(existing._id, {
                version: existing.version + 1,
                title: args.title,
                summary: args.summary,
                confirmedFacts: newFacts,
                inferredSignals: newSignals,
                unknowns: args.unknowns,
                actionsTaken: newActions,
                sentiment: args.sentiment,
                updatedAt: now,
            });
            return { success: true, id: existing._id, version: existing.version + 1 };
        }

        const id = await ctx.db.insert("contextSummaries", {
            ticketId: args.ticketId,
            version: 1,
            title: args.title,
            summary: args.summary,
            confirmedFacts: args.confirmedFacts,
            inferredSignals: args.inferredSignals,
            unknowns: args.unknowns,
            actionsTaken: args.actionsTaken,
            sentiment: args.sentiment,
            createdAt: now,
            updatedAt: now,
        });
        return { success: true, id, version: 1 };
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
