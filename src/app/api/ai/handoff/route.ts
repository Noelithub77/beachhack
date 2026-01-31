import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
    const { ticketId, ticketSubject, customerName, messages, previousTickets } =
        await req.json();

    const previousTicketsSummary =
        previousTickets && previousTickets.length > 0
            ? `Previous tickets from this customer:\n${previousTickets
                .map(
                    (t: { subject: string; status: string }) =>
                        `- ${t.subject} (${t.status})`
                )
                .join("\n")}`
            : "No previous ticket history.";

    const prompt = `Generate a comprehensive handoff summary for a support ticket being transferred to a new representative.

Ticket ID: ${ticketId}
Subject: ${ticketSubject}
Customer: ${customerName}

${previousTicketsSummary}

Recent conversation:
${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}

Create a handoff summary that includes:
1. **Issue Overview**: What the customer needs help with
2. **Context**: Relevant background information
3. **What's Been Tried**: Actions already taken
4. **Current Status**: Where things stand now
5. **Recommended Next Steps**: Suggested approach for the new rep
6. **Customer Sentiment**: How the customer is feeling

Format as markdown with clear sections.`;

    const result = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
    });

    return Response.json({ summary: result.text });
}
