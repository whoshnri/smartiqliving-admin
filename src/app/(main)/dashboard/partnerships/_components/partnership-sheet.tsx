"use client";

import { SheetField, SheetFieldGroup, SheetNote } from "@/components/editorial-fields";
import { ReplyActions } from "@/components/reply-actions";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { PartnershipSubmissionRow } from "@/types";

export function PartnershipSheet({
  submission,
  open,
  onOpenChange,
}: {
  submission: PartnershipSubmissionRow | null;
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
                  subject="Re: partnership enquiry"
                  body={`Hi ${submission.name},\n\nThank you for your interest in partnering with SmartIQLiving. I have reviewed your enquiry and would like to understand more about the project and how we can work together.\n\nYou can reply directly to this email, or let me know a good time for a call.\n\nBest regards,\nSmartIQLiving`}
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
