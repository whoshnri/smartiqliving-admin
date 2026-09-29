"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, SortableHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { PartnershipSubmissionRow } from "@/types";

import { PartnershipSheet } from "./partnership-sheet";

function buildColumns(
  onOpen: (submission: PartnershipSubmissionRow) => void,
): ColumnDef<DataTableFeatures, PartnershipSubmissionRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) => [row.name, row.email, row.phone, row.role, row.message].join(" "),
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
      id: "phone",
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-sm">{row.original.phone || "—"}</span>,
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Organisation / role",
      cell: ({ row }) => <span className="text-sm">{row.original.role || "—"}</span>,
    },
    {
      id: "message",
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <span className="block max-w-72 truncate text-sm" title={row.original.message}>
          {row.original.message}
        </span>
      ),
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

export function PartnershipsTable({ data }: { data: PartnershipSubmissionRow[] }) {
  const [selected, setSelected] = useState<PartnershipSubmissionRow | null>(null);
  const [open, setOpen] = useState(false);

  function openSubmission(submission: PartnershipSubmissionRow) {
    setSelected(submission);
    setOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={buildColumns(openSubmission)}
        data={data}
        searchColumnId="search"
        searchPlaceholder="Search partnerships…"
        hiddenColumns={["search"]}
        emptyMessage="No partnership enquiries yet."
      />

      <PartnershipSheet submission={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
