"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { FullScreenCalendar } from "@/components/calendar/full-screen-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

// Random Theme Colors for automatic assignment
const THEME_COLORS = [
  "bg-primary/20 text-primary border-primary/30",         // Sage
  "bg-[#c3a789]/20 text-[#7b5e45] border-[#c3a789]/30",   // Sand/Earth Light
  "bg-[#7b5e45]/10 text-[#7b5e45] border-[#7b5e45]/20",   // Earth Dark
];

export default function AdminCalendarPage() {
  const { user } = useAuthStore();
  const [date, setDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Creation Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "meeting" as "shift" | "meeting" | "task",
    assigneeId: "",
    priority: "medium",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
  });

  // Queries
  const users = useQuery(
    api.functions.users.listTeamMembers,
    user?.vendorId ? { vendorId: user.vendorId as Id<"vendors"> } : "skip"
  );

  // Fetch Vendor-wide Events
  const events = useQuery(
    api.functions.calendar.listByVendor,
    user?.vendorId ? { vendorId: user.vendorId as Id<"vendors"> } : "skip"
  );

  // Fetch Vendor-wide Tasks
  const tasks = useQuery(
    api.functions.tasks.listByVendor,
    user?.vendorId ? { vendorId: user.vendorId as Id<"vendors"> } : "skip"
  );

  // Mutations
  const createEvent = useMutation(api.functions.calendar.create);
  const createTask = useMutation(api.functions.tasks.create);

  // Computed Calendar Data
  const calendarData = useMemo(() => {
    const eventsByDay = new Map<string, { day: Date; events: any[] }>();

    // Helper to add to map
    const addToMap = (date: Date, item: any) => {
      const key = format(date, "yyyy-MM-dd");
      if (!eventsByDay.has(key)) {
        eventsByDay.set(key, { day: date, events: [] });
      }
      eventsByDay.get(key)!.events.push(item);
    };

    // Process Events
    events?.forEach((event) => {
      // Color consistency: Hash the ID to pick a consistent color from the pool? 
      const colorIndex = event._id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % THEME_COLORS.length;
      const colorClass = THEME_COLORS[colorIndex];

      addToMap(new Date(event.startAt), {
        id: event._id,
        name: event.title,
        time: format(event.startAt, "h:mm a"),
        datetime: event.startAt.toString(),
        type: event.type,
        className: colorClass,
        sourceType: "event",
        description: "",
      });
    });

    // Process Tasks
    tasks?.forEach((task) => {
      if (task.dueAt && task.status !== "completed") {
        const colorIndex = task._id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % THEME_COLORS.length;
        const colorClass = THEME_COLORS[colorIndex];

        addToMap(new Date(task.dueAt), {
          id: task._id,
          name: task.title,
          time: "Due",
          datetime: task.dueAt.toString(),
          type: "task",
          className: colorClass,
          sourceType: "task",
          priority: task.priority,
          description: task.description,
        });
      }
    });

    return Array.from(eventsByDay.values());
  }, [events, tasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.vendorId || !newEvent.title || !newEvent.assigneeId) return;

    try {
      if (newEvent.type === "task") {
        await createTask({
          vendorId: user.vendorId as Id<"vendors">,
          title: newEvent.title,
          assigneeId: newEvent.assigneeId as Id<"users">,
          createdById: user.id as Id<"users">,
          priority: newEvent.priority as "low" | "medium" | "high" | "urgent",
          dueAt: new Date(newEvent.date + "T" + newEvent.startTime).getTime(),
        });
        toast.success("Task assigned successfully");
      } else {
        await createEvent({
          vendorId: user.vendorId as Id<"vendors">,
          userId: newEvent.assigneeId as Id<"users">,
          title: newEvent.title,
          type: newEvent.type as "shift" | "meeting" | "other",
          startAt: new Date(newEvent.date + "T" + newEvent.startTime).getTime(),
          endAt: new Date(newEvent.date + "T" + newEvent.endTime).getTime(),
        });
        toast.success("Event scheduled successfully");
      }
      setIsDialogOpen(false);
      setNewEvent({
        title: "",
        type: "meeting",
        assigneeId: "",
        priority: "medium",
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "10:00",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create item");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row bg-background">
      {/* Sidebar / Controls */}
      <div className="w-full lg:w-80 border-r bg-card/50 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Event Manager</h1>
          <p className="text-sm text-muted-foreground">Schedule shifts, meetings, and assign tasks.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-11 text-base shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Create New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Schedule Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. Morning Shift or Urgent Fix"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(val: any) => setNewEvent({ ...newEvent, type: val })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="shift">Shift</SelectItem>
                    <SelectItem value="task">Task Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newEvent.type === "task" && (
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newEvent.priority}
                    onValueChange={(val) => setNewEvent({ ...newEvent, priority: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={newEvent.assigneeId}
                  onValueChange={(val) => setNewEvent({ ...newEvent, assigneeId: val })}
                >
                  <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                  <SelectContent>
                    {users?.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start / Due Time</Label>
                  <Input
                    type="time"
                    value={newEvent.startTime}
                    onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  />
                </div>
              </div>

              {newEvent.type !== "task" && (
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newEvent.endTime}
                    onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  />
                </div>
              )}

              <Button type="submit" className="w-full">Create & Assign</Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="shifts" defaultChecked />
                <label htmlFor="shifts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Shifts
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="meetings" defaultChecked />
                <label htmlFor="meetings" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Meetings
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="tasks" defaultChecked />
                <label htmlFor="tasks" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tasks
                </label>
              </div>
            </div>
          </div>

          <Card className="bg-transparent border-dashed">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Statistics</h3>
              <div className="flex justify-between text-sm">
                <span>Total Events</span>
                <span className="font-bold">{events?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Open Tasks</span>
                <span className="font-bold">{tasks?.filter(t => t.status !== "completed").length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        <div className="flex-1 p-2 md:p-6 overflow-y-auto">
          <FullScreenCalendar
            data={calendarData.filter(d =>
              !searchQuery || d.events.some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
            )}
            onDaySelect={setDate}
          />
        </div>
      </div>
    </div>
  );
}
