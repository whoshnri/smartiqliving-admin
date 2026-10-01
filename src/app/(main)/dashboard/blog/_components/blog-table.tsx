"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
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
import type { DataTableFeatures } from "@/lib/data-table-features";
import type { BlogPostRow } from "@/types";

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartiqliving.com";

/**
 * Resolved on the server before it reaches here. Working it out from
 * `Date.now()` during render would produce different values on the server and
 * the client, and React would flag the mismatch.
 */
export type BlogListStatus = "Draft" | "Scheduled" | "Published";

export type BlogListRow = BlogPostRow & { displayStatus: BlogListStatus };

function formatDate(value: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function buildColumns(
  onDelete: (post: BlogListRow) => void,
): ColumnDef<DataTableFeatures, BlogListRow>[] {
  return [
    {
      id: "search",
      accessorFn: (row) => [row.title, row.slug, row.excerpt, row.author.name, row.category?.name ?? ""].join(" "),
      filterFn: "includesString",
      enableHiding: false,
    },
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => <SortableHeader title="Title" column={column} />,
      cell: ({ row }) => (
        <div className="min-w-56">
          <p className="font-medium text-sm">{row.original.title}</p>
          <p className="text-muted-foreground text-xs">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      id: "category",
      accessorFn: (row) => row.category?.name ?? "—",
      header: "Category",
      cell: ({ row }) => <span className="text-sm">{row.original.category?.name ?? "—"}</span>,
    },
    {
      id: "author",
      accessorKey: "author.name",
      header: "Author",
      cell: ({ row }) => <span className="text-sm">{row.original.author.name}</span>,
    },
    {
      id: "status",
      accessorFn: (row) => row.displayStatus,
      header: "Status",
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Badge
          className="rounded-sm"
          variant={
            row.original.displayStatus === "Published"
              ? "default"
              : row.original.displayStatus === "Scheduled"
                ? "secondary"
                : "outline"
          }
        >
          {row.original.displayStatus}
        </Badge>
      ),
    },
    {
      id: "readingMinutes",
      accessorFn: (row) => row.readingMinutes ?? 0,
      header: "Read",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">
          {row.original.readingMinutes ? `${row.original.readingMinutes} min` : "—"}
        </span>
      ),
    },
    {
      id: "publishedAt",
      accessorKey: "publishedAt",
      header: ({ column }) => <SortableHeader title="Publish date" column={column} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">{formatDate(row.original.publishedAt)}</span>
      ),
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => <SortableHeader title="Updated" column={column} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">{formatDate(row.original.updatedAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/blog/${row.original.id}`}>
              <Pencil />
              Edit
            </Link>
          </Button>
          {row.original.displayStatus === "Published" ? (
            <Button asChild variant="outline" size="icon-sm">
              <a
                href={`${PUBLIC_SITE_URL}/blog/${row.original.slug}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Open post on the public site"
                title="Open on the public site"
              >
                <ExternalLink />
              </a>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete post"
            title="Delete post"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];
}

export function BlogTable({ data }: { data: BlogListRow[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<BlogListRow | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setDeleteTarget(null);

    try {
      const response = await fetch(`/api/blog/posts/${target.id}`, { method: "DELETE" });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        toast.error(body?.message ?? "Unable to delete this post.");
        return;
      }

      toast.success("Post deleted.");
      router.refresh();
    } catch {
      toast.error("Unable to delete this post.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Blog</h1>
          <p className="text-muted-foreground text-sm">
            Articles for the insights section of the public site. Publish a post to make it visible, or set a future
            date to schedule it.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <Plus />
            New post
          </Link>
        </Button>
      </div>

      <DataTable
        columns={buildColumns(setDeleteTarget)}
        data={data}
        searchColumnId="search"
        searchPlaceholder="Search posts…"
        hiddenColumns={["search"]}
        filters={[
          {
            columnId: "status",
            label: "Status",
            options: ["Published", "Scheduled", "Draft"],
          },
        ]}
        emptyMessage="No posts yet."
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be removed permanently, along with its URL on the public site. This cannot be
              undone.
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
