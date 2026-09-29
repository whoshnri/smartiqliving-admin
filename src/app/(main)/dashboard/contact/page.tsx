import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { ContactSubmissionRow } from "@/types";

import { ContactTable } from "./_components/contact-table";

export const metadata: Metadata = {
  title: "Contact enquiries | SmartIQLiving Admin",
};

export default async function ContactPage() {
  const submissions = await adminApiGet<ContactSubmissionRow[]>("contact-submissions");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Contact enquiries</h1>
        <p className="text-muted-foreground text-sm">General messages submitted through the contact form.</p>
      </div>
      <ContactTable data={submissions} />
    </div>
  );
}
