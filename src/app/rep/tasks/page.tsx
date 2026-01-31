"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Clock, Loader2, X, Calendar } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function RepTasks() {
  const { user } = useAuthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const tasks = useQuery(
    api.functions.tasks.listByAssignee,
    user?.id ? { assigneeId: user.id as Id<"users"> } : "skip",
  );

  const updateStatus = useMutation(api.functions.tasks.updateStatus);
  const createTask = useMutation(api.functions.tasks.create);

  const handleToggle = async (
    taskId: Id<"tasks">,
    currentStatus: "pending" | "in_progress" | "completed",
  ) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await updateStatus({ taskId, status: newStatus });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !user?.vendorId || !newTaskTitle.trim()) return;
    
    setIsCreating(true);
    try {
      await createTask({
        vendorId: user.vendorId as Id<"vendors">,
        assigneeId: user.id as Id<"users">,
        createdById: user.id as Id<"users">,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        dueAt: newTaskDueDate ? new Date(newTaskDueDate).getTime() : undefined,
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setShowAddForm(false);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDue = (dueAt?: number) => {
    if (!dueAt) return null;
    const now = Date.now();
    const isOverdue = dueAt < now;
    return {
      text: formatDistanceToNow(new Date(dueAt), { addSuffix: true }),
      isOverdue,
    };
  };

  const pendingTasks = tasks?.filter((t) => t.status !== "completed") ?? [];
  const completedTasks = tasks?.filter((t) => t.status === "completed") ?? [];

  if (tasks === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6f8551]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D3E2F]">Tasks</h1>
          <p className="text-muted-foreground text-sm">Your work items • {pendingTasks.length} pending</p>
        </div>
        {!showAddForm && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="gap-2 bg-[#6f8551] hover:bg-[#5a6d42]"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <Card className="border-[#6f8551]/20 bg-[#fafcf8]">
          <CardContent className="p-4">
            <form onSubmit={handleAddTask} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#2D3E2F]">New Task</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Input
                placeholder="Task title *"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="border-gray-200 focus:border-[#6f8551] focus:ring-[#6f8551]/20"
                autoFocus
              />
              
              <Input
                placeholder="Description (optional)"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="border-gray-200 focus:border-[#6f8551] focus:ring-[#6f8551]/20"
              />
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="border-gray-200 focus:border-[#6f8551] focus:ring-[#6f8551]/20 text-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!newTaskTitle.trim() || isCreating}
                    className="bg-[#6f8551] hover:bg-[#5a6d42]"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add Task"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length === 0 && completedTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks yet. Click "Add Task" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              {pendingTasks.map((task) => {
                const due = formatDue(task.dueAt);
                return (
                  <Card key={task._id} className="hover:border-[#6f8551]/30 transition-colors">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() =>
                          handleToggle(
                            task._id,
                            task.status as "pending" | "in_progress" | "completed",
                          )
                        }
                        className="border-gray-300 data-[state=checked]:bg-[#6f8551] data-[state=checked]:border-[#6f8551]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#2D3E2F] truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                        )}
                      </div>
                      {due && (
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs shrink-0",
                          due.isOverdue ? "text-red-500" : "text-muted-foreground"
                        )}>
                          <Clock className="h-3.5 w-3.5" />
                          {due.text}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide px-1">
                Completed ({completedTasks.length})
              </span>
              {completedTasks.map((task) => (
                <Card key={task._id} className="opacity-60">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() =>
                        handleToggle(
                          task._id,
                          task.status as "pending" | "in_progress" | "completed",
                        )
                      }
                      className="border-gray-300 data-[state=checked]:bg-[#6f8551] data-[state=checked]:border-[#6f8551]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2D3E2F] line-through truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-through truncate">{task.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
