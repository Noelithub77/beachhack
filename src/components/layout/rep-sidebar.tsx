"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Inbox,
  Calendar,
  ListTodo,
  BarChart3,
  Users,
  LogOut,
  PanelLeft,
  User,
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
  { label: "Inbox", href: "/rep/inbox", icon: Inbox },
  { label: "Calendar", href: "/rep/calendar", icon: Calendar },
  { label: "Tasks", href: "/rep/tasks", icon: ListTodo },
  { label: "Analytics", href: "/rep/analytics", icon: BarChart3 },
  { label: "Team", href: "/rep/team", icon: Users },
  { label: "Profile", href: "/rep/profile", icon: User },
];

// COCO Logo Component
const CocoLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M40.8 4.8C34.4348 4.8 28.3303 7.32857 23.8294 11.8294C19.3286 16.3303 16.8 22.4348 16.8 28.8C16.8 35.1652 19.3286 41.2697 23.8294 45.7706C28.3303 50.2714 34.4348 52.8 40.8 52.8"
      stroke="#7A9174"
      strokeWidth="9.6"
      strokeLinecap="round"
    />
    <path
      d="M16.8 52.8C23.1652 52.8 29.2697 50.2714 33.7706 45.7706C38.2714 41.2697 40.8 35.1652 40.8 28.8C40.8 22.4348 38.2714 16.3303 33.7706 11.8294C29.2697 7.32857 23.1652 4.8 16.8 4.8"
      stroke="#2D3E2F"
      strokeWidth="9.6"
      strokeLinecap="round"
    />
  </svg>
);

export function RepSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar, state } = useSidebar();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const roleLabel =
    user?.role === "rep_l1"
      ? "L1 Support"
      : user?.role === "rep_l2"
        ? "L2 Support"
        : "L3 Support";

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
              <Link href="/rep/inbox">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center">
                  <CocoLogo size={24} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-[#2D3E2F]">COCO</span>
                  <span className="truncate text-xs text-[#6f8551]">{roleLabel}</span>
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

