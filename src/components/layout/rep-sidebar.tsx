"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Calendar,
  CheckSquare,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/rep/inbox", icon: Inbox, label: "Inbox" },
  { href: "/rep/calendar", icon: Calendar, label: "Calendar" },
  { href: "/rep/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/rep/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/rep/team", icon: Users, label: "Team" },
];

export function RepSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card">
      {/* logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/rep/inbox"
          className="text-xl font-semibold tracking-tight"
        >
          COCO
        </Link>
        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Rep
        </span>
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
