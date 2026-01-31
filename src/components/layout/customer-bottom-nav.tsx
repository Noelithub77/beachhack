"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Building2,
  HelpCircle,
  User,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Tickets", href: "/customer/tickets", icon: Ticket },
  { label: "Chat", href: "/customer/chat", icon: MessageCircle },
  { label: "Vendors", href: "/customer/vendors", icon: Building2 },
  { label: "Profile", href: "/customer/profile", icon: User },
];

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
