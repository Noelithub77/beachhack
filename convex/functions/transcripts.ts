import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// add transcript entry
export const add = mutation({
    args: {
        callSessionId: v.id("callSessions"),
        speakerId: v.optional(v.id("users")),
        speakerType: v.union(v.literal("customer"), v.literal("rep"), v.literal("ai")),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("transcripts", {
            callSessionId: args.callSessionId,
            speakerId: args.speakerId,
            speakerType: args.speakerType,
            text: args.text,
            timestamp: Date.now(),
        });
        return { success: true, transcriptId: id };
    },
});

// get transcripts for call (real-time)
export const listByCall = query({
    args: { callSessionId: v.id("callSessions") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("transcripts")
            .withIndex("by_call", (q) => q.eq("callSessionId", args.callSessionId))
            .order("asc")
            .collect();
    },
});
