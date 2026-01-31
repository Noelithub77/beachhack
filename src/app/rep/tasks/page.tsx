"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";

const mockTasks = [
  { id: 1, title: "Follow up on TKT-1001", done: false, due: "Today" },
  {
    id: 2,
    title: "Review escalated ticket from L1",
    done: false,
    due: "Today",
  },
  {
    id: 3,
    title: "Update knowledge base article",
    done: true,
    due: "Yesterday",
  },
  { id: 4, title: "Team sync preparation", done: false, due: "Tomorrow" },
];

export default function RepTasks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground">Your assigned work items</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="space-y-2">
        {mockTasks.map((task) => (
          <Card key={task.id} className={task.done ? "opacity-60" : ""}>
            <CardContent className="flex items-center gap-3 p-4">
              <Checkbox checked={task.done} />
              <div className="flex-1">
                <p className={`font-medium ${task.done ? "line-through" : ""}`}>
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {task.due}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
