import { NextRequest, NextResponse } from "next/server";
import { Supermemory } from "supermemory";

// search memories using Supermemory SDK
export async function POST(req: NextRequest) {
    const apiKey = process.env.SUPERMEMORY_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Supermemory API key not configured" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const { query, userId, limit = 5 } = body;

        const client = new Supermemory({ apiKey });

        const result = await client.memories.search({
            query,
            containerTags: userId ? [userId] : undefined,
            topK: limit,
        });

        // format results for context injection
        const memories = (result.results || []).map((r) => ({
            content: r.content,
            score: r.score,
            metadata: r.metadata,
        }));

        return NextResponse.json({ memories });
    } catch (error) {
        console.error("[Memory] Search error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
