import { NextRequest, NextResponse } from "next/server";

// GET conversation details from ElevenLabs
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "ElevenLabs API key not configured" },
            { status: 500 }
        );
    }

    const { conversationId } = await params;

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
            {
                headers: { "xi-api-key": apiKey },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[ElevenLabs] Get conversation error:", errorText);
            return NextResponse.json(
                { error: "Failed to fetch conversation", details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[ElevenLabs] Get conversation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
