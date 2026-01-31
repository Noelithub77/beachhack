"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 10 }, (_, i) => i + 9);

const mockShifts = [
  { day: 0, start: 9, end: 17 },
  { day: 1, start: 9, end: 17 },
  { day: 2, start: 13, end: 18 },
  { day: 3, start: 9, end: 17 },
  { day: 4, start: 9, end: 14 },
];

export default function RepCalendar() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-muted-foreground">Your schedule and shifts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">
            Jan 27 - Feb 2
          </span>
          <Button variant="outline" size="icon">
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
                const shift = mockShifts.find(
                  (s) => s.day === dayIdx && hour >= s.start && hour < s.end,
                );
                return (
                  <div
                    key={dayIdx}
                    className={`border-r p-1 last:border-r-0 ${
                      shift ? "bg-primary/10" : ""
                    }`}
                  >
                    {shift && hour === shift.start && (
                      <div className="rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                        Shift
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
