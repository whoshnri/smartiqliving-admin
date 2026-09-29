"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrgSettingsRow } from "@/types";

interface SettingsValues {
  businessName: string;
  supportEmail: string;
  partnershipEmail: string;
  whatsappNumber: string;
  phoneNumber: string;
  logoUrl: string;
}

interface ContactEmailRoute {
  id: string;
  address: string;
  purpose: string;
}

function createRouteId() {
  return `route-${Math.random().toString(36).slice(2, 10)}`;
}

interface FieldConfig {
  name: keyof SettingsValues;
  label: string;
  hint: string;
  type?: string;
  placeholder?: string;
}

const fields: FieldConfig[] = [
  {
    name: "businessName",
    label: "Business name",
    hint: "Shown in page titles and footer copy.",
    placeholder: "SmartIQLiving",
  },
  {
    name: "supportEmail",
    label: "Support email",
    hint: "Used by the contact page email card.",
    type: "email",
    placeholder: "support@smartiqliving.com",
  },
  {
    name: "partnershipEmail",
    label: "Partnership email",
    hint: "Used by the partnerships page email card.",
    type: "email",
    placeholder: "partnerships@smartiqliving.com",
  },
  {
    name: "whatsappNumber",
    label: "WhatsApp number",
    hint: "Used for WhatsApp buttons across the site.",
    placeholder: "+234...",
  },
  {
    name: "phoneNumber",
    label: "Phone number",
    hint: "Shown in the footer contact list.",
    placeholder: "+234...",
  },
  {
    name: "logoUrl",
    label: "Logo URL",
    hint: "Optional logo used in the site header.",
    placeholder: "https://...",
  },
];

export function SettingsForm({ settings }: { settings: OrgSettingsRow }) {
  const router = useRouter();
  const [values, setValues] = useState<SettingsValues>({
    businessName: settings.businessName,
    supportEmail: settings.supportEmail ?? "",
    partnershipEmail: settings.partnershipEmail ?? "",
    whatsappNumber: settings.whatsappNumber ?? "",
    phoneNumber: settings.phoneNumber ?? "",
    logoUrl: settings.logoUrl ?? "",
  });
  const [contactEmails, setContactEmails] = useState<ContactEmailRoute[]>(
    settings.contactEmails?.length ? settings.contactEmails.map((email) => ({ id: createRouteId(), ...email })) : [],
  );
  const [saving, setSaving] = useState(false);

  function updateEmail(index: number, patch: Partial<ContactEmailRoute>) {
    setContactEmails((current) =>
      current.map((email, position) => (position === index ? { ...email, ...patch } : email)),
    );
  }

  function removeEmail(index: number) {
    setContactEmails((current) => current.filter((_, position) => position !== index));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          contactEmails: contactEmails.map(({ address, purpose }) => ({
            address,
            purpose,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save settings.");
      }

      toast.success("Settings saved");
      router.refresh();
    } catch {
      toast.error("Unable to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <div className="grid gap-6 rounded-xl border bg-background p-6 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={`settings-${field.name}`}>{field.label}</Label>
            <Input
              id={`settings-${field.name}`}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                }))
              }
            />
            <p className="text-muted-foreground text-xs">{field.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 rounded-xl border bg-background p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Label>Contact page emails</Label>
            <p className="text-muted-foreground text-xs">
              The inboxes and labels shown on the contact page. Order is kept as listed here.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setContactEmails((current) => [...current, { id: createRouteId(), address: "", purpose: "" }])
            }
          >
            <Plus />
            Add email
          </Button>
        </div>

        {contactEmails.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No contact emails set. The contact page will fall back to the default inboxes until you add and save some.
          </p>
        ) : (
          <div className="grid gap-3">
            {contactEmails.map((email, index) => (
              <div key={email.id} className="grid items-start gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  placeholder="address@smartiqliving.com"
                  value={email.address}
                  onChange={(event) => updateEmail(index, { address: event.target.value })}
                />
                <Input
                  placeholder="Label, e.g. General information"
                  value={email.purpose}
                  onChange={(event) => updateEmail(index, { purpose: event.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove email"
                  onClick={() => removeEmail(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
