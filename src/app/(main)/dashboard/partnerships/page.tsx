import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { PartnershipSubmissionRow } from "@/types";

import { PartnershipsTable } from "./_components/partnerships-table";

export const metadata: Metadata = {
  title: "Partnerships | SmartIQLiving Admin",
};

export default async function PartnershipsPage() {
  const submissions = await adminApiGet<PartnershipSubmissionRow[]>("partnership-submissions");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Partnerships</h1>
        <p className="text-muted-foreground text-sm">
          Partnership enquiries from developers, architects and operators.
        </p>
      </div>
      <PartnershipsTable data={submissions} />
    </div>
  );
}
