import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// list all vendors
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("vendors").filter((q) => q.eq(q.field("isActive"), true)).collect();
    },
});

// get vendor by id
export const get = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.vendorId);
    },
});

// create vendor
export const create = mutation({
    args: {
        name: v.string(),
        primaryColor: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("vendors", {
            name: args.name,
            primaryColor: args.primaryColor,
            isActive: true,
            createdAt: Date.now(),
        });
        return { success: true, vendorId: id };
    },
});

// update vendor
export const update = mutation({
    args: {
        vendorId: v.id("vendors"),
        name: v.optional(v.string()),
        primaryColor: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { vendorId, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(vendorId, filtered);
        return { success: true };
    },
});
