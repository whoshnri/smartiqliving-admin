import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { AdminUserRow } from "@/types";

import { AdminsTable } from "./_components/admins-table";

export const metadata: Metadata = {
  title: "Team | SmartIQLiving Admin",
};

export default async function AdminsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "SUPERUSER") {
    redirect("/dashboard");
  }

  const admins = await adminApiGet<AdminUserRow[]>("users");

  return <AdminsTable data={admins} currentUserId={session.id} />;
}
