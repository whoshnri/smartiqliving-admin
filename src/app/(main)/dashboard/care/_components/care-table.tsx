"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, SortableHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { CareSubmissionRow } from "@/types";

import { CareSheet } from "./care-sheet";

function clientTypeLabel(value: string) {
  return value === "EXISTING_CLIENT" ? "Existing customer" : "New customer";
}

function buildColumns(
  onOpen: (submission: CareSubmissionRow) => void,
): ColumnDef<DataTableFeatures, CareSubmissionRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) =>
        [row.name, row.email, row.phone, row.company, row.location, row.services.join(" "), row.message].join(" "),
      filterFn: "includesString",
      enableHiding: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => <SortableHeader title="Name" column={column} />,
      cell: ({ row }) => (
        <div className="min-w-40">
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-muted-foreground text-xs">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: "clientType",
      accessorKey: "clientType",
      header: "Customer",
      cell: ({ row }) => <Badge variant="outline">{clientTypeLabel(row.original.clientType)}</Badge>,
    },
    {
      id: "services",
      accessorFn: (row) => row.services.join(", "),
      header: "Services",
      cell: ({ row }) => (
        <span className="block max-w-64 truncate text-sm" title={row.original.services.join(", ")}>
          {row.original.services.join(", ") || "—"}
        </span>
      ),
    },
    {
      id: "location",
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-sm">{row.original.location || "—"}</span>,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader title="Submitted" column={column} />,
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
        <div className="text-right">
          <Button variant="outline" size="sm" onClick={() => onOpen(row.original)}>
            View details
          </Button>
        </div>
      ),
    },
  ];
}

export function CareTable({ data }: { data: CareSubmissionRow[] }) {
  const [selected, setSelected] = useState<CareSubmissionRow | null>(null);
  const [open, setOpen] = useState(false);

  function openSubmission(submission: CareSubmissionRow) {
    setSelected(submission);
    setOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={buildColumns(openSubmission)}
        data={data}
        searchColumnId="search"
        searchPlaceholder="Search care requests…"
        hiddenColumns={["search"]}
        emptyMessage="No care requests yet."
      />

      <CareSheet submission={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
