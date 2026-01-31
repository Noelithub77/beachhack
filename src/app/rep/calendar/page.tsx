"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useMemo } from "react";
import { FullScreenCalendar } from "@/components/calendar/full-screen-calendar";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function RepCalendar() {
  const { user } = useAuthStore();

  // Get events for the current month range (extended to show full calendar)
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const events = useQuery(
    api.functions.calendar.listByUser,
    user?.id
      ? {
        userId: user.id as Id<"users">,
        startFrom: monthStart.getTime(),
        endBefore: monthEnd.getTime(),
      }
      : "skip",
  );

  // Convert Convex events to FullScreenCalendar format
  const calendarData = useMemo(() => {
    if (!events) return [];

    // Group events by day
    const eventsByDay = new Map<string, { day: Date; events: { id: number; name: string; time: string; datetime: string }[] }>();

    events.forEach((event, index) => {
      const eventDate = new Date(event.startAt);
      const dayKey = format(eventDate, "yyyy-MM-dd");

      if (!eventsByDay.has(dayKey)) {
        eventsByDay.set(dayKey, {
          day: eventDate,
          events: [],
        });
      }

      eventsByDay.get(dayKey)!.events.push({
        id: index,
        name: event.title,
        time: format(eventDate, "h:mm a"),
        datetime: event.startAt.toString(),
      });
    });

    return Array.from(eventsByDay.values());
  }, [events]);

  if (events === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-muted-foreground">Your schedule and shifts</p>
      </div>

      {/* Full Screen Calendar */}
      <FullScreenCalendar data={calendarData} />
    </div>
  );
}
