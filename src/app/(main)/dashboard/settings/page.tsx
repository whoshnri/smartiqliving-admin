import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { OrgSettingsRow } from "@/types";

import { SettingsForm } from "./_components/settings-form";

export const metadata: Metadata = {
  title: "Site management | SmartIQLiving Admin",
};

export default async function SettingsPage() {
  const settings = await adminApiGet<OrgSettingsRow>("settings");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Site management</h1>
        <p className="text-muted-foreground text-sm">
          Contact details shown across the public site. Changes reflect on the website once saved.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
