"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [27, 28, 29, 30, 31, 1, 2];

const shifts = [
  { day: 0, employees: ["Sarah J.", "Mike C.", "Alex K."] },
  { day: 1, employees: ["Sarah J.", "Mike C.", "Emily D."] },
  { day: 2, employees: ["Emily D.", "Alex K."] },
  { day: 3, employees: ["Sarah J.", "Mike C.", "Alex K."] },
  { day: 4, employees: ["Sarah J.", "Emily D."] },
];

export default function AdminCalendar() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage shifts</p>
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
          <Button className="ml-2 gap-2">
            <Plus className="h-4 w-4" />
            Add Shift
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day, idx) => {
          const shift = shifts.find((s) => s.day === idx);
          return (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-baseline justify-between text-sm">
                  <span>{day}</span>
                  <span className="text-lg font-semibold">{dates[idx]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {shift ? (
                  shift.employees.map((emp) => (
                    <div
                      key={emp}
                      className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {emp}
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    No shifts
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
