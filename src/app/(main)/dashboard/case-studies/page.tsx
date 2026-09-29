import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { CaseStudyRow } from "@/types";

import { CaseStudiesTable } from "./_components/case-studies-table";

export const metadata: Metadata = {
  title: "Case studies | SmartIQLiving Admin",
};

export default async function CaseStudiesPage() {
  const caseStudies = await adminApiGet<CaseStudyRow[]>("case-studies");

  return <CaseStudiesTable data={caseStudies} />;
}
