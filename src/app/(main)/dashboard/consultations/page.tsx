import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { ConsultationRow } from "@/types";

import { ConsultationsTable } from "./_components/consultations-table";

export const metadata: Metadata = {
  title: "Consultations | SmartIQLiving Admin",
};

export default async function ConsultationsPage() {
  const consultations = await adminApiGet<ConsultationRow[]>("consultations");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Consultations</h1>
        <p className="text-muted-foreground text-sm">
          Structured project enquiries submitted through the consultation form.
        </p>
      </div>
      <ConsultationsTable data={consultations} />
    </div>
  );
}
