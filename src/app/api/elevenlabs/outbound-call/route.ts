import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const phoneNumberId = process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID;

    if (!apiKey || !agentId || !phoneNumberId) {
        return NextResponse.json(
            { error: "ElevenLabs credentials not configured" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const { toNumber, vendorName, userName, userId } = body;

        if (!toNumber) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        // initiate outbound call via ElevenLabs Twilio integration
        const response = await fetch(
            "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
            {
                method: "POST",
                headers: {
                    "xi-api-key": apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    agent_id: agentId,
                    agent_phone_number_id: phoneNumberId,
                    to_number: toNumber,
                    conversation_initiation_client_data: {
                        conversation_config_override: {
                            agent: {
                                first_message: `Hello! I'm SAGE, your AI support assistant${vendorName ? ` for ${vendorName}` : ""}. How can I help you today?`,
                            },
                        },
                        dynamic_variables: {
                            vendor_name: vendorName || "Support",
                            user_name: userName || "Customer",
                            user_id: userId || "anonymous",
                        },
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[ElevenLabs] Outbound call error:", errorText);
            return NextResponse.json(
                { error: "Failed to initiate call", details: errorText },
                { status: 500 }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            callSid: data.callSid || data.call_sid,
            conversationId: data.conversation_id,
            status: data.status || "queued",
        });
    } catch (error) {
        console.error("[ElevenLabs] Outbound call error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
