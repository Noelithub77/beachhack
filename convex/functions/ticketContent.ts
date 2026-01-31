import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const contentSource = v.union(
    v.literal("chat_message"),
    v.literal("ai_message"),
    v.literal("voice_transcript"),
    v.literal("system"),
);

const contentRole = v.union(
    v.literal("user"),
    v.literal("assistant"),
    v.literal("system"),
);

// add content entry
export const add = mutation({
    args: {
        ticketId: v.id("tickets"),
        source: contentSource,
        role: contentRole,
        content: v.string(),
        speakerId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("ticketContent", {
            ticketId: args.ticketId,
            source: args.source,
            role: args.role,
            content: args.content,
            speakerId: args.speakerId,
            timestamp: Date.now(),
        });
        return { success: true, contentId: id };
    },
});

// list all content for ticket (chronological)
export const listByTicket = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("ticketContent")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .collect();
    },
});

// get unified transcript as formatted string
export const getUnifiedTranscript = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        const content = await ctx.db
            .query("ticketContent")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .collect();

        // sort by timestamp
        content.sort((a, b) => a.timestamp - b.timestamp);

        // format as conversation
        return content.map((c) => {
            const sourceLabel = {
                chat_message: "Chat",
                ai_message: "AI",
                voice_transcript: "Voice",
                system: "System",
            }[c.source];
            const roleLabel = c.role === "user" ? "User" : c.role === "assistant" ? "Assistant" : "System";
            return `[${sourceLabel}] ${roleLabel}: ${c.content}`;
        }).join("\n");
    },
});

// get content grouped by source
export const getGroupedBySource = query({
    args: { ticketId: v.id("tickets") },
    handler: async (ctx, args) => {
        const content = await ctx.db
            .query("ticketContent")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .collect();

        content.sort((a, b) => a.timestamp - b.timestamp);

        const grouped = {
            chat: content.filter((c) => c.source === "chat_message"),
            ai: content.filter((c) => c.source === "ai_message"),
            voice: content.filter((c) => c.source === "voice_transcript"),
            system: content.filter((c) => c.source === "system"),
        };

        return grouped;
    },
});
