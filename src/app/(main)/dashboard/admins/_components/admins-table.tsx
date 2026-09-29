"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { DataTable, SortableHeader } from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { AdminUserRow } from "@/types";

import { AdminFormDialog } from "./admin-form-dialog";

const ROLE_LABEL: Record<AdminUserRow["role"], string> = {
  SUPERUSER: "Superuser",
  ADMIN: "Admin",
};

interface BuildColumnsOptions {
  currentUserId: string;
  onEdit: (admin: AdminUserRow) => void;
  onToggleActive: (admin: AdminUserRow) => void;
  onDelete: (admin: AdminUserRow) => void;
  pendingId: string | null;
}

function buildColumns({
  currentUserId,
  onEdit,
  onToggleActive,
  onDelete,
  pendingId,
}: BuildColumnsOptions): ColumnDef<DataTableFeatures, AdminUserRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) => [row.name, row.email, row.role].join(" "),
      filterFn: "includesString",
      enableHiding: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => <SortableHeader title="Name" column={column} />,
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {row.original.name}
          {row.original.id === currentUserId ? <span className="ml-2 text-muted-foreground text-xs">(you)</span> : null}
        </span>
      ),
    },
    {
      id: "email",
      accessorKey: "email",
      header: ({ column }) => <SortableHeader title="Email" column={column} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.email}</span>,
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge className="rounded-sm" variant={row.original.role === "SUPERUSER" ? "default" : "outline"}>
          {ROLE_LABEL[row.original.role]}
        </Badge>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
      header: "Status",
      cell: ({ row }) => (
        <Badge className="rounded-sm" variant={row.original.isActive ? "secondary" : "outline"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "lastLoginAt",
      accessorFn: (row) => row.lastLoginAt ?? "",
      header: ({ column }) => <SortableHeader title="Last sign-in" column={column} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">
          {row.original.lastLoginAt ? row.original.lastLoginAt.slice(0, 10) : "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const admin = row.original;
        const isSelf = admin.id === currentUserId;

        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(admin)}>
              <Pencil />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pendingId === admin.id}
                  aria-label={`More actions for ${admin.name}`}
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={isSelf} onSelect={() => onToggleActive(admin)}>
                  {admin.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" disabled={isSelf} onSelect={() => onDelete(admin)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

export function AdminsTable({ data, currentUserId }: { data: AdminUserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(admin: AdminUserRow) {
    setEditing(admin);
    setFormOpen(true);
  }

  function handleOpenChange(next: boolean) {
    setFormOpen(next);
    if (!next) setEditing(null);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function toggleActive(admin: AdminUserRow) {
    setPendingId(admin.id);

    try {
      const response = await fetch(`/api/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        toast.error(body?.message ?? "Unable to update this admin.");
        return;
      }

      toast.success(admin.isActive ? "Admin deactivated." : "Admin activated.");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setPendingId(deleteTarget.id);

    try {
      const response = await fetch(`/api/admins/${deleteTarget.id}`, { method: "DELETE" });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        toast.error(body?.message ?? "Unable to delete this admin.");
        return;
      }

      toast.success("Admin removed.");
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Team</h1>
          <p className="text-muted-foreground text-sm">
            Admin accounts that can sign in to this CRM. Superusers can add people and manage access.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Add admin
        </Button>
      </div>

      <DataTable
        columns={buildColumns({
          currentUserId,
          onEdit: openEdit,
          onToggleActive: toggleActive,
          onDelete: setDeleteTarget,
          pendingId,
        })}
        data={data}
        searchColumnId="search"
        searchPlaceholder="Search team…"
        hiddenColumns={["search"]}
        emptyMessage="No admin accounts yet."
      />

      <AdminFormDialog open={formOpen} onOpenChange={handleOpenChange} admin={editing} onSaved={handleSaved} />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this admin?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will lose access to the CRM immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
