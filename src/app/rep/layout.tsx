"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { RepSidebar } from "@/components/layout/rep-sidebar";
import { usePathname } from "next/navigation";

export default function RepLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Check if we're on a ticket detail page - these need full-height layout
  const isTicketPage = pathname.includes("/rep/inbox/") && pathname !== "/rep/inbox";

  return (
    <SidebarProvider>
      <RepSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="shrink-0 sticky top-0 z-40 flex h-12 items-center gap-4 border-b bg-white px-4">
          <SidebarTrigger />
        </header>
        <main className={isTicketPage ? "flex-1 overflow-hidden" : "flex-1 overflow-auto p-4 md:p-6"}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
