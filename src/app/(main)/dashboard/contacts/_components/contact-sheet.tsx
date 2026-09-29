"use client";

import { SheetField } from "@/components/editorial-fields";
import { ReplyActions } from "@/components/reply-actions";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ContactRow } from "@/types";

export function ContactSheet({
  contact,
  open,
  onOpenChange,
}: {
  contact: ContactRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        {contact ? (
          <>
            <SheetHeader className="border-b border-border px-6 pt-8 pb-6">
              <SheetTitle className="font-heading text-3xl leading-tight font-semibold tracking-tight">
                {contact.name ?? contact.email}
              </SheetTitle>
              <SheetDescription className="mt-1">{contact.email}</SheetDescription>
              <div className="mt-5">
                <ReplyActions
                  email={contact.email}
                  subject="Re: your enquiry to SmartIQLiving"
                  body={`Hi ${contact.name ?? "there"},\n\nThank you for your interest in SmartIQLiving. I am following up on your enquiry and would be glad to help.\n\nBest regards,\nSmartIQLiving`}
                />
              </div>
            </SheetHeader>

            <div className="px-6 py-8">
              <dl className="divide-y divide-border/70 border-t border-border/70">
                <SheetField label="Name" value={contact.name} />
                <SheetField label="Email" value={contact.email} />
                <SheetField label="Phone" value={contact.phone} />
                <SheetField label="WhatsApp" value={contact.whatsappNumber} />
                <SheetField label="Company" value={contact.company} />
                <SheetField label="Role" value={contact.role} />
              </dl>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
