"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Clock } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Review Q4 support metrics",
    assignee: "Sarah J.",
    due: "Today",
    done: false,
  },
  {
    id: 2,
    title: "Update escalation procedures",
    assignee: "Mike C.",
    due: "Tomorrow",
    done: false,
  },
  {
    id: 3,
    title: "Onboard new L1 support",
    assignee: "Emily D.",
    due: "Jan 30",
    done: false,
  },
  {
    id: 4,
    title: "Knowledge base audit",
    assignee: "Alex K.",
    due: "Feb 2",
    done: true,
  },
];

export default function AdminTasks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground">Team-wide task management</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks
              .filter((t) => !t.done)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Checkbox />
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="bg-primary/10 text-[8px] text-primary">
                          {task.assignee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {task.assignee}
                      <span className="mx-1">•</span>
                      <Clock className="h-3 w-3" />
                      {task.due}
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks
              .filter((t) => t.done)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border p-3 opacity-60"
                >
                  <Checkbox checked />
                  <div className="flex-1">
                    <p className="font-medium line-through">{task.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="bg-primary/10 text-[8px] text-primary">
                          {task.assignee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {task.assignee}
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
