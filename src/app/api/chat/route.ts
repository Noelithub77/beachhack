import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { withSupermemory } from "@supermemory/tools/ai-sdk";

const SYSTEM_PROMPT = `You are SAGE, an intelligent AI support assistant for the COCO platform.

CORE ROLE:
- Help customers resolve issues quickly and efficiently
- Provide clear, actionable solutions
- Escalate to human agents when necessary

CONTEXT AWARENESS:
You have access to the customer's conversation history and previous interactions stored in memory.
Use this context to:
- Remember details from past conversations
- Avoid asking for information already provided
- Reference previous issues and their resolutions
- Build continuity across chat and voice interactions

COMMUNICATION STYLE:
- Be friendly, professional, and empathetic
- Keep responses concise (2-4 sentences)
- Use simple language, avoid jargon
- Ask clarifying questions when needed
- Acknowledge customer frustration with empathy

ESCALATION TRIGGERS:
Offer human support when:
- Customer explicitly requests it
- Issue involves billing disputes or refunds
- Technical problem requires account access
- Customer is frustrated after 2+ attempts
- Security or privacy concerns arise

RESPONSE FORMAT:
- Start with the solution or answer
- Provide step-by-step instructions if applicable
- End with a check-in: "Did that help?" or offer next steps

Remember: You're building a relationship, not just solving tickets.`;

interface SaveContentRequest {
    ticketId: string;
    source: "ai_message";
    role: "user" | "assistant";
    content: string;
    speakerId?: string;
}

async function saveToTicketContent(
    baseUrl: string,
    data: SaveContentRequest
): Promise<void> {
    // fire and forget - don't block the response
    fetch(`${baseUrl}/api/convex/ticket-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).catch((err) => console.error("[Chat] Failed to save content:", err));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            messages,
            userId,
            ticketId,
            vendorId,
            vendorName,
            vendorContext,
        }: {
            messages: UIMessage[];
            userId?: string;
            ticketId?: string;
            vendorId?: string;
            vendorName?: string;
            vendorContext?: string;
        } = body;

        // build dynamic context
        let contextPrompt = SYSTEM_PROMPT;

        if (vendorName) {
            contextPrompt += `\n\nCURRENT VENDOR: ${vendorName}`;
            if (vendorContext) {
                contextPrompt += `\nVendor Context: ${vendorContext}`;
            }
        }

        if (ticketId) {
            contextPrompt += `\n\nACTIVE TICKET: ${ticketId}`;
        }

        const baseModel = google("gemini-2.5-flash-lite");

        // withSupermemory automatically:
        // 1. Retrieves relevant memories and injects them into context
        // 2. Saves new user messages to memory (addMemory: "always")
        // 3. Groups by conversationId for continuity
        const model = userId
            ? withSupermemory(baseModel, userId, {
                conversationId: ticketId || undefined,
                addMemory: "always",
                mode: "full",
                apiKey: process.env.SUPERMEMORY_API_KEY,
            })
            : baseModel;

        const result = streamText({
            model,
            system: contextPrompt,
            messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("[Chat] Error:", error);
        return new Response("Internal error", { status: 500 });
    }
}
