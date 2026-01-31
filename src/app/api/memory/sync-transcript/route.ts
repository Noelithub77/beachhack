import { NextRequest, NextResponse } from "next/server";
import { Supermemory } from "supermemory";

// sync call transcripts to supermemory using SDK
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
        const { userId, ticketId, vendorName, transcripts } = body;

        if (!transcripts || transcripts.length === 0) {
            return NextResponse.json({ success: true, message: "No transcripts to sync" });
        }

        // format transcripts into readable conversation
        const formattedTranscript = transcripts
            .map((t: { speaker: string; text: string }) => {
                const speaker = t.speaker === "customer" ? "Customer" : "SAGE";
                return `${speaker}: ${t.text}`;
            })
            .join("\n");

        // create content for memory
        const content = `Voice Support Call Transcript
Vendor: ${vendorName || "Unknown"}
Ticket: ${ticketId || "N/A"}

${formattedTranscript}`;

        // use Supermemory SDK to add memory
        const client = new Supermemory({ apiKey });

        const result = await client.memories.add({
            content,
            containerTag: userId,
            metadata: {
                type: "call_transcript",
                ticketId,
                vendorName,
                channel: "call",
                messageCount: transcripts.length,
            },
        });

        return NextResponse.json({ success: true, memoryId: result.id });
    } catch (error) {
        console.error("[Memory] Transcript sync error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
