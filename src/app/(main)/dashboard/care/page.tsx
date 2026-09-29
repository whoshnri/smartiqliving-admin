import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { CareSubmissionRow } from "@/types";

import { CareTable } from "./_components/care-table";

export const metadata: Metadata = {
  title: "Care requests | SmartIQLiving Admin",
};

export default async function CarePage() {
  const submissions = await adminApiGet<CareSubmissionRow[]>("care-submissions");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Care requests</h1>
        <p className="text-muted-foreground text-sm">SmartIQLiving Care enquiries submitted through the Care page.</p>
      </div>
      <CareTable data={submissions} />
    </div>
  );
}
