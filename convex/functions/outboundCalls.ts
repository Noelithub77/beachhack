import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// create outbound call record
export const create = mutation({
    args: {
        ticketId: v.id("tickets"),
        customerId: v.id("users"),
        phoneNumber: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("outboundCalls", {
            ticketId: args.ticketId,
            customerId: args.customerId,
            phoneNumber: args.phoneNumber,
            status: "initiating",
            startedAt: Date.now(),
        });
        return { success: true, callId: id };
    },
});

// update call with ElevenLabs conversation data
export const updateFromElevenLabs = mutation({
    args: {
        callId: v.id("outboundCalls"),
        conversationId: v.optional(v.string()),
        callSid: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const updates: Record<string, unknown> = {};
        if (args.conversationId) updates.conversationId = args.conversationId;
        if (args.callSid) updates.callSid = args.callSid;
        if (args.status) updates.status = args.status;
        await ctx.db.patch(args.callId, updates);
        return { success: true };
    },
});

// update call status
export const updateStatus = mutation({
    args: {
        callId: v.id("outboundCalls"),
        status: v.string(),
        endedAt: v.optional(v.number()),
        duration: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const updates: Record<string, unknown> = { status: args.status };
        if (args.endedAt) updates.endedAt = args.endedAt;
        if (args.duration) updates.duration = args.duration;
        await ctx.db.patch(args.callId, updates);
        return { success: true };
    },
});

// save transcript from ElevenLabs
export const saveTranscript = mutation({
    args: {
        callId: v.id("outboundCalls"),
        transcript: v.array(v.object({
            role: v.string(),
            content: v.string(),
            timestamp: v.optional(v.number()),
        })),
        summary: v.optional(v.string()),
        duration: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const updates: Record<string, unknown> = {
            transcript: args.transcript,
            status: "completed",
            endedAt: Date.now(),
        };
        if (args.summary) updates.summary = args.summary;
        if (args.duration) updates.duration = args.duration;
        await ctx.db.patch(args.callId, updates);
        return { success: true };
    },
});

// get outbound call by id
export const get = query({
    args: { callId: v.id("outboundCalls") },
    handler: async (ctx, args) => {
        const call = await ctx.db.get(args.callId);
        if (!call) return null;
        const customer = await ctx.db.get(call.customerId);
        const ticket = await ctx.db.get(call.ticketId);
        return { ...call, customer, ticket };
    },
});

// get outbound calls by ticket
export const getByTicket = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("outboundCalls")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .order("desc")
            .collect();
    },
});

// get by conversation id (for webhook updates)
export const getByConversation = query({
    args: { conversationId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("outboundCalls")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .first();
    },
});
