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
