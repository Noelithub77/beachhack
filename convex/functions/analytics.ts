import { v } from "convex/values";
import { query } from "../_generated/server";

// ticket stats for vendor
export const ticketStats = query({
    args: { vendorId: v.id("vendors") },
    handler: async (ctx, args) => {
        const tickets = await ctx.db
            .query("tickets")
            .withIndex("by_vendor", (q) => q.eq("vendorId", args.vendorId))
            .collect();

        const total = tickets.length;
        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};
        const byChannel: Record<string, number> = {};

        for (const t of tickets) {
            byStatus[t.status] = (byStatus[t.status] || 0) + 1;
            byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
            byChannel[t.channel] = (byChannel[t.channel] || 0) + 1;
        }

        const resolved = tickets.filter((t) => t.resolvedAt);
        const avgResolutionTime =
            resolved.length > 0
                ? resolved.reduce((acc, t) => acc + (t.resolvedAt! - t.createdAt), 0) / resolved.length
                : 0;

        return { total, byStatus, byPriority, byChannel, avgResolutionTime };
    },
});

// rep performance stats
export const repStats = query({
    args: { repId: v.id("users") },
    handler: async (ctx, args) => {
        const tickets = await ctx.db
            .query("tickets")
            .withIndex("by_rep", (q) => q.eq("assignedRepId", args.repId))
            .collect();

        const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed");
        const escalated = tickets.filter((t) => t.status === "escalated");
        const reassigned = tickets.filter((t) => t.status === "reassigned");

        return {
            total: tickets.length,
            resolved: resolved.length,
            escalated: escalated.length,
            reassigned: reassigned.length,
            resolutionRate: tickets.length > 0 ? resolved.length / tickets.length : 0,
        };
    },
});

// company-wide stats (admin)
export const companyStats = query({
    args: {},
    handler: async (ctx) => {
        const tickets = await ctx.db.query("tickets").collect();
        const users = await ctx.db.query("users").collect();
        const vendors = await ctx.db.query("vendors").collect();

        const customers = users.filter((u) => u.role === "customer");
        const reps = users.filter((u) => u.role.startsWith("rep_"));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        const ticketsToday = tickets.filter((t) => t.createdAt >= todayMs);

        return {
            totalTickets: tickets.length,
            totalCustomers: customers.length,
            totalReps: reps.length,
            totalVendors: vendors.length,
            ticketsToday: ticketsToday.length,
        };
    },
});

// rep performance stats with detailed metrics
export const repPerformance = query({
    args: { repId: v.id("users") },
    handler: async (ctx, args) => {
        const tickets = await ctx.db
            .query("tickets")
            .withIndex("by_rep", (q) => q.eq("assignedRepId", args.repId))
            .collect();

        const resolved = tickets.filter((t) => t.resolvedAt);
        const avgResolutionMs = resolved.length > 0
            ? resolved.reduce((acc, t) => acc + (t.resolvedAt! - t.createdAt), 0) / resolved.length
            : 0;

        // get feedback for rating
        const feedbackPromises = tickets.map((t) =>
            ctx.db.query("feedback").withIndex("by_ticket", (q) => q.eq("ticketId", t._id)).first()
        );
        const feedback = await Promise.all(feedbackPromises);
        const ratings = feedback.filter(Boolean).map((f) => f!.rating);
        const avgRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        // today's resolved count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedToday = resolved.filter((t) => t.resolvedAt! >= today.getTime()).length;

        // recent activity (sorted by updatedAt desc)
        const recentTickets = tickets
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 10);

        const escalated = tickets.filter((t) => t.status === "escalated").length;
        const escalationRate = tickets.length > 0 ? escalated / tickets.length : 0;

        return {
            total: tickets.length,
            resolved: resolved.length,
            resolvedToday,
            avgResolutionMinutes: Math.round(avgResolutionMs / 60000),
            avgRating: Math.round(avgRating * 10) / 10,
            escalationRate: Math.round(escalationRate * 100),
            recentActivity: recentTickets.map((t) => ({
                ticketId: t._id,
                subject: t.subject,
                status: t.status,
                updatedAt: t.updatedAt,
            })),
        };
    },
});

