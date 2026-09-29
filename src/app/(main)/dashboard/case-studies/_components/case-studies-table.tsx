"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Pencil, Plus } from "lucide-react";

import { DataTable, SortableHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { CaseStudyRow } from "@/types";

import { CaseStudyModal } from "./case-study-modal";

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartiqliving.com";

function buildColumns(onEdit: (caseStudy: CaseStudyRow) => void): ColumnDef<DataTableFeatures, CaseStudyRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) => [row.title, row.slug, row.client ?? "", row.location ?? "", row.summary].join(" "),
      filterFn: "includesString",
      enableHiding: false,
    },
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => <SortableHeader title="Title" column={column} />,
      cell: ({ row }) => (
        <div className="min-w-48">
          <p className="font-medium text-sm">{row.original.title}</p>
          <p className="text-muted-foreground text-xs">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      id: "client",
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => <span className="text-sm">{row.original.client || "—"}</span>,
    },
    {
      id: "location",
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-sm">{row.original.location || "—"}</span>,
    },
    {
      id: "images",
      accessorFn: (row) => (Array.isArray(row.images) ? row.images.length : 0),
      header: "Images",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {Array.isArray(row.original.images) ? row.original.images.length : 0}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => (row.published ? "Published" : "Draft"),
      header: "Status",
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Badge className="rounded-sm" variant={row.original.published ? "default" : "outline"}>
          {row.original.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader title="Created" column={column} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">{row.original.createdAt.slice(0, 10)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
            <Pencil />
            Edit
          </Button>
          <Button asChild variant="outline" size="icon-sm">
            <a
              href={`${PUBLIC_SITE_URL}/projects/${row.original.slug}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Open case study on the public site"
              title="Open on the public site"
            >
              <ExternalLink />
            </a>
          </Button>
        </div>
      ),
    },
  ];
}

export function CaseStudiesTable({ data }: { data: CaseStudyRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CaseStudyRow | null>(null);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(caseStudy: CaseStudyRow) {
    setEditing(caseStudy);
    setOpen(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setEditing(null);
  }

  function handleSaved() {
    setOpen(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Case studies</h1>
          <p className="text-muted-foreground text-sm">
            Projects shown in the carousel on the public site. Publish a case study to make it visible.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Add case study
        </Button>
      </div>

      <DataTable
        columns={buildColumns(openEdit)}
        data={data}
        searchColumnId="search"
        searchPlaceholder="Search case studies…"
        hiddenColumns={["search"]}
        filters={[
          {
            columnId: "status",
            label: "Status",
            options: ["Published", "Draft"],
          },
        ]}
        emptyMessage="No case studies yet."
      />

      <CaseStudyModal open={open} onOpenChange={handleOpenChange} caseStudy={editing} onSaved={handleSaved} />
    </div>
  );
}
