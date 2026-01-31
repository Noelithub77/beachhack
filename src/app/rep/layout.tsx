"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { RepSidebar } from "@/components/layout/rep-sidebar";

export default function RepLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <RepSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
