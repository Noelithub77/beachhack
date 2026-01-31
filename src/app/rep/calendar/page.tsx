"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loader2, Plus, Calendar, CheckSquare, Trash2, Clock, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { FullScreenCalendar } from "@/components/calendar/full-screen-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { cn } from "@/lib/utils";

// Extended event type to track source
interface CalendarItem {
  id: string;
  name: string;
  time: string;
  datetime: string;
  type: "shift" | "meeting" | "other" | "task";
  sourceId: string; // Original ID from database
  sourceType: "event" | "task";
}

export default function RepCalendar() {
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSelectedDay, setCurrentSelectedDay] = useState<Date>(new Date());
  
  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "meeting" as "shift" | "meeting" | "other",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Fetch events
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

  // Fetch tasks with due dates
  const tasks = useQuery(
    api.functions.tasks.listByAssignee,
    user?.id ? { assigneeId: user.id as Id<"users"> } : "skip",
  );

  const createEvent = useMutation(api.functions.calendar.create);
  const deleteEvent = useMutation(api.functions.calendar.remove);
  const deleteTask = useMutation(api.functions.tasks.remove);

  // Convert events and tasks to calendar format
  const calendarData = useMemo(() => {
    const eventsByDay = new Map<string, { day: Date; events: CalendarItem[] }>();

    // Add calendar events
    if (events) {
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
          id: `event-${index}`,
          name: event.title,
          time: format(eventDate, "h:mm a"),
          datetime: event.startAt.toString(),
          type: event.type,
          sourceId: event._id,
          sourceType: "event",
        });
      });
    }

    // Add tasks with due dates
    if (tasks) {
      tasks.forEach((task, index) => {
        if (task.dueAt && task.status !== "completed") {
          const taskDate = new Date(task.dueAt);
          const dayKey = format(taskDate, "yyyy-MM-dd");

          if (!eventsByDay.has(dayKey)) {
            eventsByDay.set(dayKey, {
              day: taskDate,
              events: [],
            });
          }

          eventsByDay.get(dayKey)!.events.push({
            id: `task-${index}`,
            name: task.title,
            time: "Due",
            datetime: task.dueAt.toString(),
            type: "task",
            sourceId: task._id,
            sourceType: "task",
          });
        }
      });
    }

    return Array.from(eventsByDay.values());
  }, [events, tasks]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !user?.vendorId || !newEvent.title.trim()) return;

    setIsCreating(true);
    try {
      const startAt = new Date(`${newEvent.date}T${newEvent.startTime}`).getTime();
      const endAt = new Date(`${newEvent.date}T${newEvent.endTime}`).getTime();

      await createEvent({
        vendorId: user.vendorId as Id<"vendors">,
        userId: user.id as Id<"users">,
        title: newEvent.title.trim(),
        type: newEvent.type,
        startAt,
        endAt,
      });

      setNewEvent({
        title: "",
        type: "meeting",
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "10:00",
      });
      setIsDialogOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    setIsDeleting(true);
    try {
      if (selectedItem.sourceType === "event") {
        await deleteEvent({ eventId: selectedItem.sourceId as Id<"calendarEvents"> });
      } else {
        await deleteTask({ taskId: selectedItem.sourceId as Id<"tasks"> });
      }
      setSelectedItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEventClick = (event: CalendarItem) => {
    setSelectedItem(event);
  };

  // Count upcoming items
  const upcomingEvents = events?.length ?? 0;
  const pendingTasks = tasks?.filter((t) => t.dueAt && t.status !== "completed").length ?? 0;

  if (events === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#6f8551]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D3E2F]">Calendar</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#6f8551]" />
              {upcomingEvents} events
            </span>
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
              {pendingTasks} tasks due
            </span>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#6f8551] hover:bg-[#5a6d42]">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#2D3E2F]">Create Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="Meeting with team..."
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="border-gray-200 focus:border-[#6f8551]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(v) => setNewEvent({ ...newEvent, type: v as "shift" | "meeting" | "other" })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="shift">Shift</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="border-gray-200 focus:border-[#6f8551]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="border-gray-200 focus:border-[#6f8551]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="border-gray-200 focus:border-[#6f8551]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newEvent.title.trim() || isCreating}
                  className="bg-[#6f8551] hover:bg-[#5a6d42]"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6f8551]" />
          <span className="text-muted-foreground">Events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Tasks Due</span>
        </div>
        <span className="text-muted-foreground text-[10px]">• Click any item to view details</span>
      </div>

      <FullScreenCalendar 
        data={calendarData} 
        onEventClick={handleEventClick}
        onDaySelect={(date) => {
             // We can use local state if needed, but since the calendar is uncontrolled mostly 
             // we just need to know which day is selected to show details below.
             // However, FullScreenCalendar manages its own selectedDay state.
             // We'll add a state here to track it.
             setCurrentSelectedDay(date);
        }}
      />

      {/* Selected Day Details */}
      {currentSelectedDay && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 pb-3">
             <h3 className="font-semibold leading-none tracking-tight">
                {format(currentSelectedDay, "EEEE, MMMM d")}
             </h3>
             <p className="text-sm text-muted-foreground">
                {
                    calendarData.filter(d => format(d.day, "yyyy-MM-dd") === format(currentSelectedDay, "yyyy-MM-dd"))
                    .flatMap(d => d.events).length
                } items scheduled
             </p>
          </div>
          <div className="p-6 pt-0">
             <div className="space-y-2">
                {calendarData
                  .filter(d => format(d.day, "yyyy-MM-dd") === format(currentSelectedDay, "yyyy-MM-dd"))
                  .flatMap(d => d.events)
                  .map((event) => (
                    <div 
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors",
                            event.type === "task" || event.sourceType === "task"
                                ? "bg-amber-50/50 border-amber-100 hover:bg-amber-100/50 hover:border-amber-200"
                                : "bg-muted/30 border-transparent hover:bg-muted hover:border-border"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {event.type === "task" || event.sourceType === "task" ? (
                                <CheckSquare className="h-4 w-4 text-amber-500" />
                            ) : (
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    event.type === "shift" ? "bg-blue-500" :
                                    event.type === "meeting" ? "bg-[#6f8551]" : "bg-gray-400"
                                )} />
                            )}
                            <div>
                                <p className="text-sm font-medium">{event.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {event.time}
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  ))}
                  {calendarData
                    .filter(d => format(d.day, "yyyy-MM-dd") === format(currentSelectedDay, "yyyy-MM-dd"))
                    .flatMap(d => d.events).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                            No events scheduled for this day
                        </div>
                    )}
             </div>
          </div>
        </div>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem?.sourceType === "task" ? (
                <CheckSquare className="h-4 w-4 text-amber-500" />
              ) : (
                <Calendar className="h-4 w-4 text-[#6f8551]" />
              )}
              {selectedItem?.sourceType === "task" ? "Task" : "Event"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-[#2D3E2F]">{selectedItem.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedItem.time}
                  {selectedItem.datetime && (
                    <span>• {format(new Date(parseInt(selectedItem.datetime)), "MMM d, yyyy")}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  selectedItem.sourceType === "task" 
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-[#6f8551]/10 text-[#6f8551]"
                )}>
                  {selectedItem.type}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="gap-1"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
