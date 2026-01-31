import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// start call session
export const start = mutation({
    args: {
        ticketId: v.id("tickets"),
        callerId: v.id("users"),
        receiverId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("callSessions", {
            ticketId: args.ticketId,
            callerId: args.callerId,
            receiverId: args.receiverId,
            status: "ringing",
            startedAt: Date.now(),
        });
        return { success: true, callSessionId: id };
    },
});

// answer call
export const answer = mutation({
    args: {
        callSessionId: v.id("callSessions"),
        receiverId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.callSessionId, {
            status: "in_progress",
            receiverId: args.receiverId,
        });
        return { success: true };
    },
});

// end call
export const end = mutation({
    args: { callSessionId: v.id("callSessions") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.callSessionId, {
            status: "ended",
            endedAt: Date.now(),
        });
        return { success: true };
    },
});

// get active call for user
export const getActive = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const assCaller = await ctx.db
            .query("callSessions")
            .withIndex("by_caller", (q) => q.eq("callerId", args.userId))
            .filter((q) => q.neq(q.field("status"), "ended"))
            .first();
        return assCaller;
    },
});

// get call by ticket
export const getByTicket = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("callSessions")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .order("desc")
            .first();
    },
});

// update twilio sid
export const setTwilioSid = mutation({
    args: {
        callSessionId: v.id("callSessions"),
        twilioSid: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.callSessionId, { twilioSid: args.twilioSid });
        return { success: true };
    },
});
