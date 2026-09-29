"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { LogOut, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { adminNavGroups } from "@/config/nav";
import type { AdminSession } from "@/lib/auth";

export function AppSidebar({ session }: { session: AdminSession }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, isMobile } = useSidebar();

  const collapsed = !isMobile && state === "collapsed";

  const navGroups = adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(session.role)),
    }))
    .filter((group) => group.items.length > 0);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="SmartIQLiving CRM">
              <Link href="/dashboard">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" />
                </span>
                {collapsed ? null : <span className="font-semibold">SmartIQLiving CRM</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            {collapsed ? null : <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.url
                    : pathname === item.url || pathname.startsWith(`${item.url}/`);

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon />
                          {collapsed ? null : <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {collapsed ? null : (
          <div className="mb-2 flex flex-col gap-1 rounded-md border p-3">
            <span className="truncate font-medium text-sm">{session.name}</span>
            <span className="truncate text-muted-foreground text-xs">{session.email}</span>
            <Badge className="mt-1 w-fit rounded-sm" variant="outline">
              {session.role === "SUPERUSER" ? "Superuser" : "Admin"}
            </Badge>
          </div>
        )}
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          className={collapsed ? undefined : "w-full justify-start gap-2"}
          onClick={logout}
          aria-label="Sign out"
        >
          <LogOut className="size-4" />
          {collapsed ? null : <span>Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
