import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const contextSchema = z.object({
    summary: z.string().describe("Brief summary of the conversation/ticket"),
    confirmedFacts: z
        .array(z.string())
        .describe("Facts explicitly stated by the customer"),
    inferredSignals: z
        .array(z.string())
        .describe("Inferred context from conversation patterns"),
    unknowns: z
        .array(z.string())
        .describe("Questions or information still needed"),
    actionsTaken: z
        .array(z.string())
        .describe("Actions already taken to address the issue"),
    sentiment: z
        .enum(["positive", "neutral", "frustrated", "urgent"])
        .describe("Overall customer sentiment"),
    suggestedNextSteps: z
        .array(z.string())
        .describe("Recommended actions for the rep"),
});

export async function POST(req: Request) {
    const { messages, ticketSubject } = await req.json();

    const prompt = `Analyze this customer support conversation and extract structured context.
  
Ticket Subject: ${ticketSubject || "Unknown"}

Conversation:
${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}

Extract the key information to help a support representative understand the situation quickly.`;

    const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: contextSchema,
        prompt,
    });

    return Response.json(result.object);
}
