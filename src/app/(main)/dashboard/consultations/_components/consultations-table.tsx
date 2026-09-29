"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, SortableHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { ConsultationRow } from "@/types";

import { ConsultationSheet } from "./consultation-sheet";

function formatDate(value: string) {
  return value.slice(0, 10);
}

function buildColumns(
  onOpen: (consultation: ConsultationRow) => void,
): ColumnDef<DataTableFeatures, ConsultationRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) =>
        [
          row.customer.name,
          row.customer.email,
          row.customer.phone,
          row.customer.company ?? "",
          row.location,
          row.message,
          row.interestedIn.join(" "),
        ].join(" "),
      filterFn: "includesString",
      enableHiding: false,
    },
    {
      id: "name",
      accessorFn: (row) => row.customer.name,
      header: ({ column }) => <SortableHeader title="Name" column={column} />,
      cell: ({ row }) => (
        <div className="min-w-40">
          <p className="font-medium text-sm">{row.original.customer.name}</p>
          <p className="text-muted-foreground text-xs">{row.original.customer.email}</p>
        </div>
      ),
    },
    {
      id: "phone",
      accessorFn: (row) => row.customer.phone,
      header: "Phone",
      cell: ({ row }) => <span className="text-sm">{row.original.customer.phone}</span>,
    },
    {
      id: "type",
      accessorKey: "type",
      header: "Type",
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Badge className="rounded-sm" variant="outline">
          {row.original.type === "RESIDENTIAL" ? "Residential" : "Commercial"}
        </Badge>
      ),
    },
    {
      id: "location",
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-sm">{row.original.location}</span>,
    },
    {
      id: "projectStage",
      accessorKey: "projectStage",
      header: "Stage",
      cell: ({ row }) => <span className="text-sm">{row.original.projectStage}</span>,
    },
    {
      id: "services",
      accessorFn: (row) => row.interestedIn.join(", "),
      header: "Services",
      cell: ({ row }) => (
        <span className="block max-w-56 truncate text-sm" title={row.original.interestedIn.join(", ")}>
          {row.original.interestedIn.join(", ") || "—"}
        </span>
      ),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader title="Submitted" column={column} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">{formatDate(row.original.createdAt)}</span>
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

export function ConsultationsTable({ data }: { data: ConsultationRow[] }) {
  const [selected, setSelected] = useState<ConsultationRow | null>(null);
  const [open, setOpen] = useState(false);

  function openConsultation(consultation: ConsultationRow) {
    setSelected(consultation);
    setOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={buildColumns(openConsultation)}
        data={data}
        searchColumnId="search"
        searchPlaceholder="Search consultations…"
        hiddenColumns={["search"]}
        filters={[
          {
            columnId: "type",
            label: "Type",
            options: ["RESIDENTIAL", "COMMERCIAL"],
          },
        ]}
        emptyMessage="No consultations yet."
      />

      <ConsultationSheet consultation={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
