import type { ReactNode } from "react";

export function SheetField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <dt className="shrink-0 text-muted-foreground text-xs uppercase tracking-[0.14em]">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm">
        {value === null || value === undefined || value === "" ? "—" : value}
      </dd>
    </div>
  );
}

export function SheetFieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h3 className="text-muted-foreground text-xs uppercase tracking-[0.16em]">{title}</h3>
      <dl className="mt-3 divide-y divide-border/70 border-t border-border/70">{children}</dl>
    </section>
  );
}

export function SheetNote({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h3 className="text-muted-foreground text-xs uppercase tracking-[0.16em]">{label}</h3>
      <p className="mt-3 whitespace-pre-wrap border-t border-border/70 pt-4 text-sm leading-relaxed">{children}</p>
    </section>
  );
}
