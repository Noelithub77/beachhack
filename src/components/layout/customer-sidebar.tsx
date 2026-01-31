"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Building2,
  HelpCircle,
  User,
  LogOut,
  PanelLeft,
  Brain,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Tickets", href: "/customer/tickets", icon: Ticket },
  { label: "Memory", href: "/customer/memory", icon: Brain },
  { label: "Vendors", href: "/customer/vendors", icon: Building2 },
  { label: "Help", href: "/customer/help", icon: HelpCircle },
  { label: "Profile", href: "/customer/profile", icon: User },
];

// COCO Logo Component
const CocoLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size * 1.7} viewBox="0 0 34 58" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28.8 4.8C22.4348 4.8 16.3303 7.32857 11.8294 11.8294C7.32855 16.3303 4.79999 22.4348 4.79999 28.8C4.79999 35.1652 7.32855 41.2697 11.8294 45.7706C16.3303 50.2714 22.4348 52.8 28.8 52.8" stroke="#7A9174" strokeWidth="9.6" strokeLinecap="round"/>
    <path d="M4.79999 52.8C11.1652 52.8 17.2697 50.2714 21.7705 45.7706C26.2714 41.2697 28.8 35.1652 28.8 28.8C28.8 22.4348 26.2714 16.3303 21.7705 11.8294C17.2697 7.32857 11.1652 4.8 4.79999 4.8" stroke="#2D3E2F" strokeWidth="9.6" strokeLinecap="round"/>
  </svg>
);

export function CustomerSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { toggleSidebar, state } = useSidebar();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Sidebar 
      collapsible="icon" 
      {...props}
      className={cn(
        "border-r border-[#6f8551]/10 bg-gradient-to-b from-white via-[#fafcf8] to-[#f5f8f2]",
        props.className
      )}
    >
      <SidebarHeader className="border-b border-[#6f8551]/10 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-[#6f8551]/5">
              <Link href="/customer/dashboard">
                <div className="flex aspect-square size-10 items-center justify-center">
                  <CocoLogo size={24} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-[#2D3E2F]">COCO</span>
                  <span className="truncate text-xs text-[#6f8551]">Customer Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-[#6f8551] text-white shadow-md shadow-[#6f8551]/20 hover:bg-[#5a6d42] hover:text-white"
                      : "text-[#4a5a38]/70 hover:bg-[#6f8551]/10 hover:text-[#2D3E2F]",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#6f8551]/10 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={state === "expanded" ? "Collapse" : "Expand"}
              className="text-[#6f8551] hover:bg-[#6f8551]/10 hover:text-[#4a5a38] rounded-lg"
            >
              <PanelLeft
                className={cn("h-4 w-4 transition-transform", state === "collapsed" ? "rotate-180" : "")}
              />
              <span>Collapse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              tooltip="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

