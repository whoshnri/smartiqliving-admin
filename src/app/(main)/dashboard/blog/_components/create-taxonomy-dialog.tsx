"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";
import type { BlogAuthorRow, BlogCategoryRow } from "@/types";

type Kind = "category" | "author";

interface CreateTaxonomyDialogProps {
  kind: Kind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (created: BlogCategoryRow | BlogAuthorRow) => void;
}

/**
 * Lets an editor create a category or author without leaving the post, which
 * matters because the first post has neither to choose from.
 */
export function CreateTaxonomyDialog({ kind, open, onOpenChange, onCreated }: CreateTaxonomyDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) return;

    setName("");
    setSlug("");
    setSlugTouched(false);
    setRole("");
    setDescription("");
  }, [open]);

  // Keep the slug in step with the name until it is edited by hand.
  useEffect(() => {
    if (kind !== "category" || slugTouched) return;
    setSlug(slugify(name));
  }, [kind, name, slugTouched]);

  const isCategory = kind === "category";
  const canSubmit = name.trim().length > 0 && (!isCategory || slug.trim().length > 0);

  async function submit() {
    if (!canSubmit) return;

    setSaving(true);

    try {
      const response = await fetch(isCategory ? "/api/blog/categories" : "/api/blog/authors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          isCategory
            ? { name: name.trim(), slug: slug.trim(), description: description.trim() }
            : { name: name.trim(), role: role.trim() },
        ),
      });

      const body = (await response.json().catch(() => null)) as {
        data?: BlogCategoryRow | BlogAuthorRow;
        message?: string;
        errors?: string[];
      } | null;

      if (!response.ok || !body?.data) {
        throw new Error(body?.errors?.[0] ?? body?.message ?? "Unable to save.");
      }

      toast.success(isCategory ? "Category created" : "Author created");
      onCreated(body.data);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCategory ? "New category" : "New author"}</DialogTitle>
          <DialogDescription>
            {isCategory
              ? "Categories group posts on the public blog. A post can belong to one."
              : "Authors are credited on the post and shown on the public site."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tax-name">Name</Label>
            <Input id="tax-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          {isCategory ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="tax-slug">Slug</Label>
                <Input
                  id="tax-slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tax-description">Description</Label>
                <Textarea
                  id="tax-description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="tax-role">Role</Label>
              <Input
                id="tax-role"
                placeholder="Founder, SmartIQLiving"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!canSubmit || saving} onClick={submit}>
            {saving ? "Saving…" : isCategory ? "Create category" : "Create author"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
