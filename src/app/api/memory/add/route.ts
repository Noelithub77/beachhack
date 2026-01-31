import { NextRequest, NextResponse } from "next/server";
import { Supermemory } from "supermemory";

// add memory to supermemory using SDK
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
        const { content, userId, type, metadata } = body;

        const client = new Supermemory({ apiKey });

        const result = await client.memories.add({
            content,
            containerTag: userId,
            metadata: {
                type,
                timestamp: Date.now(),
                ...metadata,
            },
        });

        return NextResponse.json({ success: true, memoryId: result.id });
    } catch (error) {
        console.error("[Memory] Add error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
