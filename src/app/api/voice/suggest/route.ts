import { NextRequest, NextResponse } from "next/server";
import { Supermemory } from "supermemory";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
    const apiKey = process.env.SUPERMEMORY_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Supermemory API not configured" },
            { status: 500 }
        );
    }

    try {
        const { transcript, userId, vendorName } = await req.json();

        if (!transcript) {
            return NextResponse.json({ suggestion: null });
        }

        const client = new Supermemory({ apiKey });

        // search for relevant memories
        const searchResult = await client.search.execute({
            q: transcript,
            containerTags: userId ? [userId] : undefined,
            limit: 3,
        });

        const memories = (searchResult.results || [])
            .map((r) => {
                if ("memory" in r) return r.memory;
                if ("chunk" in r) return r.chunk;
                return null;
            })
            .filter(Boolean);

        if (memories.length === 0) {
            return NextResponse.json({ suggestion: null, memories: [] });
        }

        // generate suggestion using AI
        const contextStr = memories.join("\n---\n");

        const { text } = await generateText({
            model: google("gemini-2.5-flash-lite"),
            system: `You are a helpful support assistant providing real-time suggestions to a customer service representative during a live call.
Based on the customer's speech and their previous interaction history, provide a brief, actionable suggestion.
Keep suggestions concise (1-2 sentences max). Focus on relevant facts from history that help address the current topic.
If the history isn't relevant to what the customer is saying, respond with just "null".`,
            prompt: `Customer is calling about: ${vendorName || "support"}

Customer just said: "${transcript}"

Previous interaction history:
${contextStr}

Provide a brief suggestion for the rep, or respond with "null" if history isn't relevant.`,
        });

        const suggestion = text === "null" ? null : text;

        return NextResponse.json({
            suggestion,
            memories: memories.slice(0, 2),
        });
    } catch (error) {
        console.error("[Suggest] Error:", error);
        return NextResponse.json({ error: "Suggestion failed" }, { status: 500 });
    }
}
