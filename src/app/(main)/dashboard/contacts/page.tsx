import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { ContactRow } from "@/types";

import { ContactsTable } from "./_components/contacts-table";

export const metadata: Metadata = {
  title: "Contacts | SmartIQLiving Admin",
};

export default async function ContactsPage() {
  const contacts = await adminApiGet<ContactRow[]>("contacts");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Contacts</h1>
        <p className="text-muted-foreground text-sm">
          One record per email, created on first enquiry and updated on every later submission.
        </p>
      </div>
      <ContactsTable data={contacts} />
    </div>
  );
}
