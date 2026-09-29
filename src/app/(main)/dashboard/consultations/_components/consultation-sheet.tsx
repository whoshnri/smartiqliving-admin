"use client";

import { SheetField, SheetFieldGroup, SheetNote } from "@/components/editorial-fields";
import { ReplyActions } from "@/components/reply-actions";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ConsultationRow } from "@/types";

export function ConsultationSheet({
  consultation,
  open,
  onOpenChange,
}: {
  consultation: ConsultationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isCommercial = consultation?.type === "COMMERCIAL";
  const customer = consultation?.customer;
  const property = consultation?.property;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        {consultation && customer ? (
          <>
            <SheetHeader className="border-b border-border px-6 pt-8 pb-6">
              <SheetTitle className="font-heading text-3xl leading-tight font-semibold tracking-tight">
                {customer.name}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {customer.email} · {customer.phone}
              </SheetDescription>
              <div className="mt-5">
                <ReplyActions
                  email={customer.email}
                  subject="Re: your consultation enquiry"
                  body={`Hi ${customer.name},\n\nThank you for contacting SmartIQLiving about your project in ${consultation.location}. I have reviewed the details you shared and would like to talk through the next steps.\n\nYou can reply directly to this email, or let me know a good time for a call.\n\nBest regards,\nSmartIQLiving`}
                />
              </div>
            </SheetHeader>

            <div className="px-6 py-8">
              <SheetFieldGroup title="Contact">
                <SheetField label="Full name" value={customer.name} />
                <SheetField label="Email" value={customer.email} />
                <SheetField label="Phone" value={customer.phone} />
                <SheetField label="WhatsApp" value={customer.whatsappNumber} />
                <SheetField label="Preferred contact" value={customer.preferredContact} />
                <SheetField label="Company" value={customer.company} />
                <SheetField label="Job title" value={customer.jobTitle} />
              </SheetFieldGroup>

              <SheetFieldGroup title="Project">
                <SheetField label="Type" value={isCommercial ? "Commercial" : "Residential"} />
                <SheetField label="Location" value={consultation.location} />
                <SheetField label="Stage" value={consultation.projectStage} />
                <SheetField label="Status" value={consultation.status} />
                <SheetField label="Services" value={consultation.interestedIn.join(", ")} />
                {isCommercial ? (
                  <>
                    <SheetField label="Project type" value={consultation.projectType} />
                    <SheetField label="Units" value={consultation.units} />
                    <SheetField label="Project value" value={consultation.projectValueRange} />
                    <SheetField label="Target delivery" value={consultation.targetDelivery} />
                    <SheetField label="Drawings / specs" value={consultation.drawingsStatus} />
                  </>
                ) : (
                  <>
                    <SheetField label="Property status" value={property?.propertyStatus} />
                    <SheetField label="Approximate size" value={property?.propertySize} />
                    <SheetField label="Expected completion" value={property?.expectedCompletion} />
                    <SheetField label="Budget range" value={property?.budgetRange} />
                  </>
                )}
              </SheetFieldGroup>

              <SheetNote label="Message">{consultation.message}</SheetNote>

              <SheetFieldGroup title="Meta">
                <SheetField label="Submitted" value={consultation.createdAt.slice(0, 10)} />
                <SheetField label="Reference" value={consultation.id} />
              </SheetFieldGroup>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
