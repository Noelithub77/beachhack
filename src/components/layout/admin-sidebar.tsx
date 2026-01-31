"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Calendar,
  ListTodo,
  Building2,
  Settings,
  LogOut,
  PanelLeft,
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
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Calendar", href: "/admin/calendar", icon: Calendar },
  { label: "Tasks", href: "/admin/tasks", icon: ListTodo },
  { label: "Vendors", href: "/admin/vendors", icon: Building2 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar, state } = useSidebar();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const roleLabel =
    user?.role === "admin_manager"
      ? "Manager"
      : user?.role === "admin_senior"
        ? "Senior Admin"
        : "Super Admin";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">C</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">COCO</span>
                  <span className="truncate text-xs">{roleLabel}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={state === "expanded" ? "Collapse" : "Expand"}
            >
              <PanelLeft
                className={state === "collapsed" ? "rotate-180" : ""}
              />
              <span>Collapse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
              tooltip="Logout"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
