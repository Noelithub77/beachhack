"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useState, useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  isWithinInterval,
  getDay,
  getHours,
} from "date-fns";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 10 }, (_, i) => i + 9);

export default function RepCalendar() {
  const { user } = useAuthStore();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const events = useQuery(
    api.functions.calendar.listByUser,
    user?.id
      ? {
          userId: user.id as Id<"users">,
          startFrom: weekStart.getTime(),
          endBefore: weekEnd.getTime(),
        }
      : "skip",
  );

  // map events to grid
  const eventMap = useMemo(() => {
    if (!events) return new Map();
    const map = new Map<string, { title: string; type: string }>();

    events.forEach((event) => {
      const startDate = new Date(event.startAt);
      const endDate = new Date(event.endAt);
      const dayIndex = (getDay(startDate) + 6) % 7;
      const startHour = getHours(startDate);
      const endHour = getHours(endDate);

      for (let h = startHour; h < endHour && h < 19; h++) {
        map.set(`${dayIndex}-${h}`, { title: event.title, type: event.type });
      }
    });

    return map;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-muted-foreground">Your schedule and shifts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* schedule grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="border-r p-3 text-sm font-medium text-muted-foreground" />
            {days.map((day) => (
              <div
                key={day}
                className="border-r p-3 text-center text-sm font-medium last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b last:border-b-0"
            >
              <div className="border-r p-2 text-right text-xs text-muted-foreground">
                {hour}:00
              </div>
              {days.map((_, dayIdx) => {
                const event = eventMap.get(`${dayIdx}-${hour}`);
                return (
                  <div
                    key={dayIdx}
                    className={`border-r p-1 last:border-r-0 ${
                      event ? "bg-primary/10" : ""
                    }`}
                  >
                    {event && (
                      <div className="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground truncate">
                        {event.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      {events.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No scheduled events this week
        </p>
      )}
    </div>
  );
}
