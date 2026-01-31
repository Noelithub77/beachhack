import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const contextSchema = z.object({
    title: z.string().describe("Concise, descriptive title for the ticket (max 60 chars)"),
    summary: z.string().describe("Brief summary of the conversation/ticket"),
    confirmedFacts: z.array(z.string()).describe("Facts explicitly stated by the customer"),
    inferredSignals: z.array(z.string()).describe("Inferred context from conversation patterns"),
    unknowns: z.array(z.string()).describe("Questions or information still needed"),
    actionsTaken: z.array(z.string()).describe("Actions already taken to address the issue"),
    sentiment: z.enum(["positive", "neutral", "frustrated", "urgent"]).describe("Overall customer sentiment"),
    suggestedNextSteps: z.array(z.string()).describe("Recommended actions for the rep"),
});

export async function POST(req: Request) {
    const { messages, ticketSubject, existingContext } = await req.json();

    // build prompt with existing context for incremental updates
    let contextPrompt = "";
    if (existingContext) {
        contextPrompt = `
Previous Context (version ${existingContext.version || 1}):
- Title: ${existingContext.title || ticketSubject || "Unknown"}
- Summary: ${existingContext.summary || "None"}
- Facts: ${existingContext.confirmedFacts?.join(", ") || "None"}

Build upon this existing context with the new messages below.
`;
    }

    const prompt = `Analyze this customer support conversation and extract structured context.
${contextPrompt}
Ticket Subject: ${ticketSubject || "Unknown"}

Conversation:
${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}

Extract key information to help a support representative understand the situation quickly.
Generate a concise title that captures the main issue.`;

    const result = await generateObject({
        model: google("gemini-2.5-flash-lite"),
        schema: contextSchema,
        prompt,
    });

    return Response.json(result.object);
}
