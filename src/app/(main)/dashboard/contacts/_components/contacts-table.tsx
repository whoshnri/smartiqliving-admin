"use client";

import { useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable, SortableHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { ContactRow } from "@/types";

import { ContactSheet } from "./contact-sheet";

function buildColumns(onOpen: (contact: ContactRow) => void): ColumnDef<DataTableFeatures, ContactRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) => [row.name, row.email, row.phone, row.company, row.role].join(" "),
      filterFn: "includesString",
      enableHiding: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => <SortableHeader title="Contact" column={column} />,
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.name || "—"}</span>,
    },
    {
      id: "email",
      accessorKey: "email",
      header: ({ column }) => <SortableHeader title="Email" column={column} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.email}</span>,
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-sm">{row.original.phone || "—"}</span>,
    },
    {
      id: "company",
      accessorKey: "company",
      header: "Company / role",
      cell: ({ row }) => (
        <div className="min-w-32">
          <p className="text-sm">{row.original.company || "—"}</p>
          {row.original.role ? <p className="text-muted-foreground text-xs">{row.original.role}</p> : null}
        </div>
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

export function ContactsTable({ data }: { data: ContactRow[] }) {
  const [selected, setSelected] = useState<ContactRow | null>(null);
  const [open, setOpen] = useState(false);

  function openContact(contact: ContactRow) {
    setSelected(contact);
    setOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={buildColumns(openContact)}
        data={data}
        searchColumnId="search"
        searchPlaceholder="Search contacts…"
        hiddenColumns={["search"]}
        emptyMessage="No contacts yet."
      />

      <ContactSheet contact={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
