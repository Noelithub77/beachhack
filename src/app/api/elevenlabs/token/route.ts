import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
        return NextResponse.json(
            { error: "ElevenLabs credentials not configured" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const { vendorName, vendorContext, userName, userId } = body;

        // get conversation token from ElevenLabs
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
            {
                method: "GET",
                headers: {
                    "xi-api-key": apiKey,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[ElevenLabs] Token error:", errorText);
            return NextResponse.json(
                { error: "Failed to get conversation token" },
                { status: 500 }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            token: data.token,
            agentId,
            // pass context for client-side dynamic variables
            context: {
                vendorName: vendorName || "Support",
                vendorContext: vendorContext || "",
                userName: userName || "Customer",
                userId: userId || "anonymous",
            },
        });
    } catch (error) {
        console.error("[ElevenLabs] Token generation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
