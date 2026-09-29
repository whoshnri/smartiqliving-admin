"use client";

import { useState } from "react";

import { Check, Copy, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReplyActions({ email, subject, body }: { email: string; subject: string; body: string }) {
  const [copied, setCopied] = useState(false);
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <a href={mailto}>
          <Mail />
          Reply by email
        </a>
      </Button>
      <Button variant="outline" onClick={copyEmail}>
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy email"}
      </Button>
    </div>
  );
}
