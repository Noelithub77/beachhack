import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const ticketStatus = v.union(
    v.literal("created"),
    v.literal("intake_in_progress"),
    v.literal("waiting_for_agent"),
    v.literal("assigned"),
    v.literal("in_progress"),
    v.literal("reassigned"),
    v.literal("escalated"),
    v.literal("resolved"),
    v.literal("closed"),
    v.literal("reopened")
);

// create new ticket
export const create = mutation({
    args: {
        customerId: v.id("users"),
        vendorId: v.id("vendors"),
        channel: v.union(v.literal("chat"), v.literal("call"), v.literal("email"), v.literal("docs")),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
        subject: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const id = await ctx.db.insert("tickets", {
            ...args,
            status: "created",
            createdAt: now,
            updatedAt: now,
        });
        return { success: true, ticketId: id };
    },
});

// get ticket by id
export const get = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.ticketId);
    },
});

// list tickets for customer
export const listByCustomer = query({
    args: { customerId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tickets")
            .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
            .order("desc")
            .collect();
    },
});

// list tickets for vendor (rep inbox)
export const listByVendor = query({
    args: {
        vendorId: v.id("vendors"),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db
            .query("tickets")
            .withIndex("by_vendor", (qb) => qb.eq("vendorId", args.vendorId));

        if (args.status) {
            q = q.filter((qb) => qb.eq(qb.field("status"), args.status));
        }
        return await q.order("desc").collect();
    },
});

// list tickets assigned to rep
export const listByRep = query({
    args: { repId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tickets")
            .withIndex("by_rep", (q) => q.eq("assignedRepId", args.repId))
            .order("desc")
            .collect();
    },
});

// update ticket status
export const updateStatus = mutation({
    args: {
        ticketId: v.id("tickets"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const updates: Record<string, any> = {
            status: args.status,
            updatedAt: Date.now(),
        };
        if (args.status === "resolved") updates.resolvedAt = Date.now();
        if (args.status === "closed") updates.closedAt = Date.now();

        await ctx.db.patch(args.ticketId, updates);
        return { success: true };
    },
});

// assign ticket to rep
export const assign = mutation({
    args: {
        ticketId: v.id("tickets"),
        repId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.ticketId, {
            assignedRepId: args.repId,
            status: "assigned",
            updatedAt: Date.now(),
        });
        return { success: true };
    },
});

// escalate ticket
export const escalate = mutation({
    args: {
        ticketId: v.id("tickets"),
        newRepId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.ticketId, {
            status: "escalated",
            assignedRepId: args.newRepId,
            updatedAt: Date.now(),
        });
        return { success: true };
    },
});

// reassign ticket
export const reassign = mutation({
    args: {
        ticketId: v.id("tickets"),
        newRepId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.ticketId, {
            status: "reassigned",
            assignedRepId: args.newRepId,
            updatedAt: Date.now(),
        });
        return { success: true };
    },
});
