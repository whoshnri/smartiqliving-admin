import {
  Building2,
  FileText,
  Handshake,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { AdminRole } from "@/types";

export interface AdminNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
  /** When set, the item is only shown to these roles. */
  roles?: AdminRole[];
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "Forms",
    items: [
      {
        title: "Consultations",
        url: "/dashboard/consultations",
        icon: Building2,
      },
      {
        title: "Contact enquiries",
        url: "/dashboard/contact",
        icon: Inbox,
      },
      {
        title: "Partnerships",
        url: "/dashboard/partnerships",
        icon: Handshake,
      },
      {
        title: "Care requests",
        url: "/dashboard/care",
        icon: HeartHandshake,
      },
    ],
  },
  {
    title: "Contacts",
    items: [
      {
        title: "Contacts",
        url: "/dashboard/contacts",
        icon: Users,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        title: "Case studies",
        url: "/dashboard/case-studies",
        icon: FileText,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Site management",
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Team",
        url: "/dashboard/admins",
        icon: ShieldCheck,
        roles: ["SUPERUSER"],
      },
    ],
  },
];
