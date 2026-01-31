import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// structured schema for AI ticket processing
const ticketAnalysisSchema = z.object({
    title: z.string().describe("Concise, descriptive title for the ticket (max 60 chars)"),
    summary: z.string().describe("Brief summary of the conversation"),
    confirmedFacts: z.array(z.string()).describe("Facts explicitly stated by the customer"),
    inferredSignals: z.array(z.string()).describe("Inferred context from conversation patterns"),
    unknowns: z.array(z.string()).describe("Questions or information still needed"),
    actionsTaken: z.array(z.string()).describe("Actions already taken to address the issue"),
    sentiment: z.enum(["positive", "neutral", "frustrated", "urgent"]).describe("Overall customer sentiment"),
    tasks: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]),
        dueInDays: z.number().optional().describe("Days from now when task is due"),
    })).describe("Follow-up tasks extracted from conversation"),
    calendarEvents: z.array(z.object({
        title: z.string(),
        type: z.enum(["meeting", "other"]),
        suggestedDate: z.string().optional().describe("ISO date string if mentioned"),
        durationMinutes: z.number(),
    })).describe("Meetings or scheduled events mentioned"),
});

export async function POST(req: Request) {
    try {
        const { ticketId, conversation, vendorName, customerName } = await req.json();

        if (!conversation || conversation.length === 0) {
            return Response.json({ error: "No conversation content provided" }, { status: 400 });
        }

        // format conversation for prompt
        const formattedConversation = conversation
            .map((c: { source: string; role: string; content: string }) => {
                const sourceLabel = {
                    chat_message: "Chat",
                    ai_message: "AI",
                    voice_transcript: "Voice",
                    system: "System",
                }[c.source] || c.source;
                return `[${sourceLabel}] ${c.role}: ${c.content}`;
            })
            .join("\n");

        const prompt = `Analyze this customer support conversation and extract structured information.

Ticket ID: ${ticketId || "New"}
Vendor: ${vendorName || "Unknown"}
Customer: ${customerName || "Unknown"}

Conversation:
${formattedConversation}

Instructions:
1. Generate a concise, descriptive title (max 60 chars) that captures the main issue
2. Summarize the conversation briefly
3. Extract confirmed facts, inferred signals, unknowns, and actions taken
4. Determine customer sentiment
5. Extract any follow-up tasks mentioned or implied
6. Extract any meetings or scheduled events mentioned

Be thorough but concise. Focus on actionable insights.`;

        const result = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: ticketAnalysisSchema,
            prompt,
        });

        return Response.json({
            success: true,
            ticketId,
            analysis: result.object,
        });
    } catch (error) {
        console.error("[Process Ticket] Error:", error);
        return Response.json({ error: "Failed to process ticket" }, { status: 500 });
    }
}
