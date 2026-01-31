import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// list all vendors
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("vendors")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// list all vendor categories
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const vendors = await ctx.db
      .query("vendors")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    const categories = [
      ...new Set(vendors.map((v) => v.category).filter(Boolean)),
    ];
    return categories as string[];
  },
});

// list vendors with user favorites
export const listWithFavorites = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const vendors = await ctx.db
      .query("vendors")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    const favorites = await ctx.db
      .query("userFavorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const favoriteVendorIds = new Set(favorites.map((f) => f.vendorId));

    return vendors.map((vendor) => ({
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
    category: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("vendors", {
      name: args.name,
      primaryColor: args.primaryColor,
      category: args.category,
      description: args.description,
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
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    supportPhone: v.optional(v.string()),
    slaResponseHours: v.optional(v.number()),
    contractStartDate: v.optional(v.number()),
    contractEndDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { vendorId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );
    await ctx.db.patch(vendorId, filtered);
    return { success: true };
  },
});

// toggle favorite vendor
export const toggleFavorite = mutation({
  args: {
    userId: v.id("users"),
    vendorId: v.id("vendors"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_vendor", (q) =>
        q.eq("userId", args.userId).eq("vendorId", args.vendorId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { isFavorite: false };
    } else {
      await ctx.db.insert("userFavorites", {
        userId: args.userId,
        vendorId: args.vendorId,
        createdAt: Date.now(),
      });
      return { isFavorite: true };
    }
  },
});

// get user favorites
export const getUserFavorites = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("userFavorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return favorites.map((f) => f.vendorId);
  },
});

// get vendor with stats
export const getWithStats = query({
  args: {
    vendorId: v.id("vendors"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor) return null;

    // Get ticket stats for this vendor
    const allTickets = await ctx.db
      .query("tickets")
      .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
      .collect();

    // User's tickets with this vendor
    let userTickets: typeof allTickets = [];
    if (args.userId) {
      userTickets = allTickets.filter((t) => t.customerId === args.userId);
    }

    // Check if favorited
    let isFavorite = false;
    if (args.userId) {
      const fav = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_vendor", (q) =>
          q.eq("userId", args.userId).eq("vendorId", args.vendorId)
        )
        .first();
      isFavorite = !!fav;
    }

    return {
      ...vendor,
      isFavorite,
      stats: {
        totalTickets: userTickets.length,
        openTickets: userTickets.filter(
          (t) => !["closed", "resolved"].includes(t.status)
        ).length,
        resolvedTickets: userTickets.filter((t) => t.status === "resolved")
          .length,
      },
    };
  },
});
