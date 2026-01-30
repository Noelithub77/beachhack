"use client";

import * as React from "react";
import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  QrCode,
  BarChart3,
  ChefHat,
  LogOut,
  Settings,
  ArrowLeft,
  Phone,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Id } from "@/../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { authClient } from "@/lib/auth/auth-client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import UserCard from "@/components/UserCard";
import { cn } from "@/lib/utils";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  restaurantId: Id<"restaurants">;
}

export function AppSidebar({ restaurantId, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const restaurant = useQuery(api.functions.restaurants.get, { id: restaurantId });
  const [userRole, setUserRole] = useState<{ role: string; subrole: string | null } | null>(null);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const isAdmin = userRole?.role === "admin";
  const isWaiter = userRole?.subrole === "waiter";
  const isKitchen = userRole?.subrole === "kitchen";
  const isCashier = userRole?.subrole === "cashier";

  const navItems = [
    {
      label: "Dashboard",
      href: `/manage/${restaurantId}/dashboard`,
      icon: LayoutDashboard,
      hidden: !isAdmin,
    },
    {
      label: "Menu",
      href: `/manage/${restaurantId}/menu`,
      icon: UtensilsCrossed,
      hidden: isCashier,
    },
    {
      label: "Orders",
      href: `/manage/${restaurantId}/orders`,
      icon: ShoppingBag,
      hidden: isKitchen,
    },
    {
      label: "Billing",
      href: `/manage/${restaurantId}/billing`,
      icon: Receipt,
      hidden: !isAdmin,
    },
    {
      label: "Staff",
      href: `/manage/${restaurantId}/staff`,
      icon: Users,
      hidden: !isAdmin,
    },
    {
      label: "Analytics",
      href: `/manage/${restaurantId}/analytics`,
      icon: BarChart3,
      hidden: !isAdmin,
    },
    {
      label: "QR Codes",
      href: `/manage/${restaurantId}/qr-codes`,
      icon: QrCode,
      hidden: isCashier,
    },
    {
      label: "Kitchen",
      href: `/manage/${restaurantId}/kitchen`,
      icon: ChefHat,
      hidden: isWaiter || isCashier,
    },
    {
      label: "Contact",
      href: `/manage/${restaurantId}/contact`,
      icon: Phone,
      hidden: isCashier,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/manage">
                {restaurant?.logoUrl ? (
                  <img
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    className="size-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ChefHat className="size-4" />
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {restaurant?.name || "Loading..."}
                  </span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.filter((item) => !item.hidden).map((item) => {
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
                      : "text-muted-foreground hover:text-foreground"
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
        <div className="p-1">
          <UserCard restaurantId={restaurantId} onRoleLoad={setUserRole} inSidebar={true} />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
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
