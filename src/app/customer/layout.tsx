"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <CustomerSidebar className="hidden md:flex" />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-semibold">COCO</span>
        </header>
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </SidebarInset>
      <CustomerBottomNav />
    </SidebarProvider>
  );
}
