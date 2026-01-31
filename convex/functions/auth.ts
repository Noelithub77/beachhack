import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// login with email/password
export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) return { success: false, error: "User not found" };
        if (!user.isActive) return { success: false, error: "Account inactive" };

        // simple password check (in production use bcrypt)
        const isValid = user.passwordHash === args.password;
        if (!isValid) return { success: false, error: "Invalid password" };

        return {
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                vendorId: user.vendorId,
                language: user.language,
                avatarUrl: user.avatarUrl,
            },
        };
    },
});

// get user by id
export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

// get current user session (for client-side auth)
export const me = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        if (!args.userId) return null;
        const user = await ctx.db.get(args.userId);
        if (!user || !user.isActive) return null;
        return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            vendorId: user.vendorId,
            language: user.language,
            avatarUrl: user.avatarUrl,
        };
    },
});

// get all users by role
export const getUsersByRole = query({
    args: { role: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", args.role as any))
            .collect();
    },
});

// get reps for a vendor
export const getVendorReps = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .filter((q) =>
                q.or(
                    q.eq(q.field("role"), "rep_l1"),
                    q.eq(q.field("role"), "rep_l2"),
                    q.eq(q.field("role"), "rep_l3")
                )
            )
            .collect();
    },
});
