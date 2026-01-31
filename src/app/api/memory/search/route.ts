import { NextRequest, NextResponse } from "next/server";
import { Supermemory } from "supermemory";

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

        const result = await client.search.execute({
            q: query,
            containerTags: userId ? [userId] : undefined,
            limit,
        });

        // format results for context injection
        const memories = (result.results || []).map((r) => {
            // handle both memory and chunk results
            if ("memory" in r) {
                return {
                    content: r.memory,
                    score: r.score,
                };
            } else if ("chunk" in r) {
                return {
                    content: r.chunk,
                    score: r.score,
                };
            }
            return {
                content: String(r),
                score: 0,
            };
        });

        return NextResponse.json({ memories });
    } catch (error) {
        console.error("[Memory] Search error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
