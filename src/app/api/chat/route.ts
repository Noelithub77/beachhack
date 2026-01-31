import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { withSupermemory } from "@supermemory/tools/ai-sdk";

const SYSTEM_PROMPT = `You are SAGE, an AI support assistant for COCO platform.
You help customers with their support inquiries in a friendly, professional manner.
Be concise but helpful. Ask clarifying questions when needed.
If an issue requires human assistance, let the customer know you can connect them with a support representative.`;

export async function POST(req: Request) {
    const { messages, userId }: { messages: UIMessage[]; userId?: string } =
        await req.json();

    const baseModel = google("gemini-2.5-flash");

    // wrap with supermemory if user id provided
    const model = userId
        ? withSupermemory(baseModel, userId, {
            addMemory: "always",
            mode: "full",
        })
        : baseModel;

    const result = streamText({
        model,
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}
