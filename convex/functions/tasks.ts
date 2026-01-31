import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// create task
export const create = mutation({
    args: {
        vendorId: v.id("vendors"),
        assigneeId: v.id("users"),
        createdById: v.id("users"),
        title: v.string(),
        description: v.optional(v.string()),
        dueAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("tasks", {
            vendorId: args.vendorId,
            assigneeId: args.assigneeId,
            createdById: args.createdById,
            title: args.title,
            description: args.description,
            status: "pending",
            dueAt: args.dueAt,
            createdAt: Date.now(),
        });
        return { success: true, taskId: id };
    },
});

// update task status
export const updateStatus = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.taskId, { status: args.status });
        return { success: true };
    },
});

// list tasks for user
export const listByAssignee = query({
    args: { assigneeId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tasks")
            .withIndex("by_assignee", (q) => q.eq("assigneeId", args.assigneeId))
            .order("desc")
            .collect();
    },
});

// list tasks for vendor
export const listByVendor = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tasks")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .order("desc")
            .collect();
    },
});
