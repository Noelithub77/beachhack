import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const ticketId = url.searchParams.get("ticketId");

        if (!ticketId) {
            return Response.json({ error: "Missing ticketId" }, { status: 400 });
        }

        const content = await convex.query(api.functions.ticketContent.listByTicket, {
            ticketId: ticketId as Id<"tickets">,
        });

        return Response.json(content);
    } catch (error) {
        console.error("[Ticket Content] GET Error:", error);
        return Response.json({ error: "Failed to fetch content" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { ticketId, source, role, content, speakerId } = body;

        if (!ticketId || !source || !role || !content) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await convex.mutation(api.functions.ticketContent.add, {
            ticketId: ticketId as Id<"tickets">,
            source,
            role,
            content,
            speakerId: speakerId as Id<"users"> | undefined,
        });

        return Response.json(result);
    } catch (error) {
        console.error("[Ticket Content] POST Error:", error);
        return Response.json({ error: "Failed to save content" }, { status: 500 });
    }
}
