import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// apply AI analysis results to update ticket, context, tasks, and events
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            ticketId,
            vendorId,
            userId,
            analysis,
        }: {
            ticketId: string;
            vendorId: string;
            userId: string;
            analysis: {
                title: string;
                summary: string;
                confirmedFacts: string[];
                inferredSignals: string[];
                unknowns: string[];
                actionsTaken: string[];
                sentiment: string;
                tasks: Array<{
                    title: string;
                    description?: string;
                    priority: string;
                    dueInDays?: number;
                }>;
                calendarEvents: Array<{
                    title: string;
                    type: "meeting" | "other";
                    suggestedDate?: string;
                    durationMinutes: number;
                }>;
            };
        } = body;

        // update ticket title
        await convex.mutation(api.functions.tickets.updateTitle, {
            ticketId: ticketId as Id<"tickets">,
            subject: analysis.title,
        });

        // upsert context summary
        await convex.mutation(api.functions.context.upsert, {
            ticketId: ticketId as Id<"tickets">,
            title: analysis.title,
            summary: analysis.summary,
            confirmedFacts: analysis.confirmedFacts,
            inferredSignals: analysis.inferredSignals,
            unknowns: analysis.unknowns,
            actionsTaken: analysis.actionsTaken,
            sentiment: analysis.sentiment,
        });

        // create tasks
        const taskResults = [];
        for (const task of analysis.tasks) {
            const dueAt = task.dueInDays
                ? Date.now() + task.dueInDays * 24 * 60 * 60 * 1000
                : undefined;

            const result = await convex.mutation(api.functions.tasks.createFromAi, {
                vendorId: vendorId as Id<"vendors">,
                assigneeId: userId as Id<"users">,
                sourceTicketId: ticketId as Id<"tickets">,
                title: task.title,
                description: task.description,
                dueAt,
            });
            taskResults.push(result);
        }

        // create calendar events
        const eventResults = [];
        for (const event of analysis.calendarEvents) {
            const startAt = event.suggestedDate
                ? new Date(event.suggestedDate).getTime()
                : Date.now() + 24 * 60 * 60 * 1000; // default: tomorrow
            const endAt = startAt + event.durationMinutes * 60 * 1000;

            const result = await convex.mutation(api.functions.calendar.createFromAi, {
                vendorId: vendorId as Id<"vendors">,
                userId: userId as Id<"users">,
                sourceTicketId: ticketId as Id<"tickets">,
                title: event.title,
                type: event.type,
                startAt,
                endAt,
            });
            eventResults.push(result);
        }

        return Response.json({
            success: true,
            tasksCreated: taskResults.length,
            eventsCreated: eventResults.length,
        });
    } catch (error) {
        console.error("[Apply Analysis] Error:", error);
        return Response.json({ error: "Failed to apply analysis" }, { status: 500 });
    }
}
