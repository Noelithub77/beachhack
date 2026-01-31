import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// add transcript and sync to ticketContent
export const add = mutation({
    args: {
        callSessionId: v.id("callSessions"),
        speakerId: v.optional(v.id("users")),
        speakerType: v.union(v.literal("customer"), v.literal("rep"), v.literal("ai")),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // insert transcript
        const id = await ctx.db.insert("transcripts", {
            callSessionId: args.callSessionId,
            speakerId: args.speakerId,
            speakerType: args.speakerType,
            text: args.text,
            timestamp: now,
        });

        // get call session to find ticketId
        const callSession = await ctx.db.get(args.callSessionId);
        if (callSession) {
            const role = args.speakerType === "customer" ? "user" as const :
                args.speakerType === "ai" ? "assistant" as const : "system" as const;

            // save to ticketContent
            await ctx.db.insert("ticketContent", {
                ticketId: callSession.ticketId,
                source: "voice_transcript",
                role,
                content: args.text,
                speakerId: args.speakerId,
                timestamp: now,
            });

            // count content for this ticket
            const contentCount = await ctx.db
                .query("ticketContent")
                .withIndex("by_ticket", (q) => q.eq("ticketId", callSession.ticketId))
                .collect();

            // trigger AI processing flag after every 2 entries
            const shouldProcess = contentCount.length > 0 && contentCount.length % 2 === 0;

            return { success: true, transcriptId: id, shouldProcess, ticketId: callSession.ticketId };
        }

        return { success: true, transcriptId: id, shouldProcess: false };
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
