import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// list all vendors
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("vendors").filter((q) => q.eq(q.field("isActive"), true)).collect();
    },
});

// list all vendor categories
export const listCategories = query({
    args: {},
    handler: async (ctx) => {
        const vendors = await ctx.db.query("vendors").filter((q) => q.eq(q.field("isActive"), true)).collect();
        const categories = [...new Set(vendors.map(v => v.category).filter(Boolean))];
        return categories as string[];
    },
});

// list vendors with user favorites
export const listWithFavorites = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const vendors = await ctx.db.query("vendors").filter((q) => q.eq(q.field("isActive"), true)).collect();
        const favorites = await ctx.db
            .query("userFavorites")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
        
        const favoriteVendorIds = new Set(favorites.map(f => f.vendorId));
        
        return vendors.map(vendor => ({
            ...vendor,
            isFavorite: favoriteVendorIds.has(vendor._id),
        }));
    },
});

// get vendor by id
export const get = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.vendorId);
    },
});

// get vendor by id (alternative name for consistency)
export const getById = query({
    args: { id: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
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
