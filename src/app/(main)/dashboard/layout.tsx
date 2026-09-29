import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getVerifiedSession } from "@/lib/api";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getVerifiedSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset className="min-w-0 overflow-x-clip">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-muted-foreground text-sm">
            Signed in as <span className="text-foreground">{session.email}</span>
          </span>
        </header>
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
