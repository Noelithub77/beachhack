"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { formatDistanceToNow } from "date-fns";

export default function RepTasks() {
  const { user } = useAuthStore();

  const tasks = useQuery(
    api.functions.tasks.listByAssignee,
    user?.id ? { assigneeId: user.id as Id<"users"> } : "skip",
  );

  const updateStatus = useMutation(api.functions.tasks.updateStatus);

  const handleToggle = async (
    taskId: Id<"tasks">,
    currentStatus: "pending" | "in_progress" | "completed",
  ) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await updateStatus({ taskId, status: newStatus });
  };

  const formatDue = (dueAt?: number) => {
    if (!dueAt) return null;
    return formatDistanceToNow(new Date(dueAt), { addSuffix: true });
  };

  if (tasks === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks assigned to you</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card
              key={task._id}
              className={task.status === "completed" ? "opacity-60" : ""}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() =>
                    handleToggle(
                      task._id,
                      task.status as "pending" | "in_progress" | "completed",
                    )
                  }
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>
                {task.dueAt && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDue(task.dueAt)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
