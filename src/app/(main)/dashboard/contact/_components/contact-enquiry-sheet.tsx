"use client";

import { SheetField, SheetFieldGroup, SheetNote } from "@/components/editorial-fields";
import { ReplyActions } from "@/components/reply-actions";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ContactSubmissionRow } from "@/types";

export function ContactEnquirySheet({
  submission,
  open,
  onOpenChange,
}: {
  submission: ContactSubmissionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        {submission ? (
          <>
            <SheetHeader className="border-b border-border px-6 pt-8 pb-6">
              <SheetTitle className="font-heading text-3xl leading-tight font-semibold tracking-tight">
                {submission.name}
              </SheetTitle>
              <SheetDescription className="mt-1">{submission.email}</SheetDescription>
              <div className="mt-5">
                <ReplyActions
                  email={submission.email}
                  subject="Re: your enquiry to SmartIQLiving"
                  body={`Hi ${submission.name},\n\nThank you for contacting SmartIQLiving. I have received your message and will follow up shortly.\n\nIf anything else is useful in the meantime, just reply to this email.\n\nBest regards,\nSmartIQLiving`}
                />
              </div>
            </SheetHeader>

            <div className="px-6 py-8">
              <SheetFieldGroup title="Contact">
                <SheetField label="Name" value={submission.name} />
                <SheetField label="Email" value={submission.email} />
                <SheetField label="Phone" value={submission.phone} />
                <SheetField label="Organisation / role" value={submission.role} />
              </SheetFieldGroup>

              <SheetNote label="Message">{submission.message}</SheetNote>

              <SheetFieldGroup title="Meta">
                <SheetField label="Submitted" value={submission.createdAt.slice(0, 10)} />
                <SheetField label="Reference" value={submission.id} />
              </SheetFieldGroup>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
