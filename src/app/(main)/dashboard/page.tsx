import Link from "next/link";

import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApiGet } from "@/lib/api";
import type {
  AnalyticsSummary,
  CareSubmissionRow,
  CaseStudyRow,
  ConsultationRow,
  ContactRow,
  ContactSubmissionRow,
  PartnershipSubmissionRow,
} from "@/types";

import { AnalyticsOverview } from "./_components/analytics-overview";

export const metadata: Metadata = {
  title: "Home | SmartIQLiving Admin",
};

async function safeGet<T>(path: string): Promise<T[]> {
  try {
    return await adminApiGet<T[]>(path);
  } catch {
    return [];
  }
}

/** Single-object variant of `safeGet`, for endpoints that return one summary. */
async function safeGetOne<T>(path: string): Promise<T | null> {
  try {
    return await adminApiGet<T>(path);
  } catch {
    return null;
  }
}

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  createdAt: string;
  href: string;
};

export default async function DashboardPage() {
  const [consultations, contactSubmissions, partnerships, careRequests, contacts, caseStudies, analytics] =
    await Promise.all([
      safeGet<ConsultationRow>("consultations"),
      safeGet<ContactSubmissionRow>("contact-submissions"),
      safeGet<PartnershipSubmissionRow>("partnership-submissions"),
      safeGet<CareSubmissionRow>("care-submissions"),
      safeGet<ContactRow>("contacts"),
      safeGet<CaseStudyRow>("case-studies"),
      safeGetOne<AnalyticsSummary>("analytics/summary"),
    ]);

  const stats = [
    {
      title: "Consultations",
      value: consultations.length,
      href: "/dashboard/consultations",
    },
    {
      title: "Contact enquiries",
      value: contactSubmissions.length,
      href: "/dashboard/contact",
    },
    {
      title: "Partnerships",
      value: partnerships.length,
      href: "/dashboard/partnerships",
    },
    {
      title: "Care requests",
      value: careRequests.length,
      href: "/dashboard/care",
    },
    {
      title: "Contacts",
      value: contacts.length,
      href: "/dashboard/contacts",
    },
    {
      title: "Case studies",
      value: caseStudies.length,
      href: "/dashboard/case-studies",
    },
  ];

  const activity: ActivityItem[] = [
    ...consultations.map((row) => ({
      id: `consultation-${row.id}`,
      type: "Consultation",
      title: row.customer?.name || row.customer?.email || "Consultation",
      subtitle: row.type === "COMMERCIAL" ? "Commercial project" : "Residential project",
      createdAt: row.createdAt,
      href: "/dashboard/consultations",
    })),
    ...contactSubmissions.map((row) => ({
      id: `contact-${row.id}`,
      type: "Contact",
      title: row.name,
      subtitle: row.email,
      createdAt: row.createdAt,
      href: "/dashboard/contact",
    })),
    ...partnerships.map((row) => ({
      id: `partnership-${row.id}`,
      type: "Partnership",
      title: row.name,
      subtitle: row.email,
      createdAt: row.createdAt,
      href: "/dashboard/partnerships",
    })),
    ...careRequests.map((row) => ({
      id: `care-${row.id}`,
      type: "Care",
      title: row.name,
      subtitle: row.clientType === "EXISTING_CLIENT" ? "Existing customer" : "New customer",
      createdAt: row.createdAt,
      href: "/dashboard/care",
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Home</h1>
        <p className="text-muted-foreground text-sm">
          An overview of enquiries, leads and content across SmartIQLiving.
        </p>
      </div>

      {analytics ? (
        <AnalyticsOverview summary={analytics} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Today&rsquo;s traffic</CardTitle>
            <CardDescription>Traffic data is unavailable right now.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="group">
            <Card className="h-full transition-colors group-hover:ring-foreground/20">
              <CardHeader>
                <CardDescription>{stat.title}</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>The latest submissions across every form.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {activity.length === 0 ? (
            <p className="px-4 pb-4 text-muted-foreground text-sm">No submissions yet.</p>
          ) : (
            <ul className="divide-y">
              {activity.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{item.title}</p>
                      <p className="truncate text-muted-foreground text-xs">{item.subtitle}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge variant="outline">{item.type}</Badge>
                      <span className="text-muted-foreground text-xs tabular-nums">{item.createdAt.slice(0, 10)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
