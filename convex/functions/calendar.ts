import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// create calendar event
export const create = mutation({
    args: {
        vendorId: v.id("vendors"),
        userId: v.id("users"),
        title: v.string(),
        type: v.union(v.literal("shift"), v.literal("meeting"), v.literal("other")),
        startAt: v.number(),
        endAt: v.number(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("calendarEvents", args);
        return { success: true, eventId: id };
    },
});

// update event
export const update = mutation({
    args: {
        eventId: v.id("calendarEvents"),
        title: v.optional(v.string()),
        startAt: v.optional(v.number()),
        endAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { eventId, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(eventId, filtered);
        return { success: true };
    },
});

// delete event
export const remove = mutation({
    args: { eventId: v.id("calendarEvents") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.eventId);
        return { success: true };
    },
});

// list events for user
export const listByUser = query({
    args: {
        userId: v.id("users"),
        startFrom: v.optional(v.number()),
        endBefore: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db
            .query("calendarEvents")
            .withIndex("by_user", (qb) => qb.eq("userId", args.userId));

        let events = await q.collect();

        if (args.startFrom) {
            events = events.filter((e) => e.endAt >= args.startFrom!);
        }
        if (args.endBefore) {
            events = events.filter((e) => e.startAt <= args.endBefore!);
        }

        return events.sort((a, b) => a.startAt - b.startAt);
    },
});

// list events for vendor (admin view)
export const listByVendor = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("calendarEvents")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();
    },
});
