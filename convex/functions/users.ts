import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// update user profile
export const updateProfile = mutation({
    args: {
        userId: v.id("users"),
        name: v.optional(v.string()),
        language: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { userId, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(userId, filtered);
        return { success: true };
    },
});

// list all users (admin only)
export const listUsers = query({
    args: { vendorId: v.optional(v.id("vendors")) },
    handler: async (ctx, args) => {
        if (args.vendorId) {
            return await ctx.db
                .query("users")
                .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
                .collect();
        }
        return await ctx.db.query("users").collect();
    },
});

// toggle user active status
export const toggleUserStatus = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return { success: false };
        await ctx.db.patch(args.userId, { isActive: !user.isActive });
        return { success: true, isActive: !user.isActive };
    },
});

// create new user (admin)
export const createUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
        role: v.string(),
        vendorId: v.optional(v.id("vendors")),
        language: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
        if (existing) return { success: false, error: "Email already exists" };

        const id = await ctx.db.insert("users", {
            email: args.email,
            passwordHash: args.password,
            name: args.name,
            role: args.role as any,
            vendorId: args.vendorId,
            language: args.language,
            isActive: true,
            createdAt: Date.now(),
        });
        return { success: true, userId: id };
    },
});

// list team members (reps) for a vendor with ticket counts
export const listTeamMembers = query({
    args: { vendorId: v.optional(v.id("vendors")) },
    handler: async (ctx, args) => {
        let users;
        if (args.vendorId) {
            users = await ctx.db
                .query("users")
                .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
                .collect();
        } else {
            users = await ctx.db.query("users").collect();
        }

        // filter to reps only
        const reps = users.filter((u) => u.role.startsWith("rep_"));

        // get ticket counts per rep
        const withCounts = await Promise.all(
            reps.map(async (rep) => {
                const tickets = await ctx.db
                    .query("tickets")
                    .withIndex("by_rep", (q) => q.eq("assignedRepId", rep._id))
                    .collect();
                const activeTickets = tickets.filter(
                    (t) => t.status !== "closed" && t.status !== "resolved"
                );
                return {
                    id: rep._id,
                    name: rep.name,
                    role: rep.role,
                    isActive: rep.isActive,
                    ticketCount: activeTickets.length,
                };
            })
        );

        return withCounts;
    },
});

