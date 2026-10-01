"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type EditorJS from "@editorjs/editorjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, ImagePlus, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fromDateTimeLocal, slugify, toDateTimeLocal } from "@/lib/slug";
import type { BlogAuthorRow, BlogCategoryRow, BlogPostDetail, EditorJsDocument } from "@/types";

import { uploadImageToR2 } from "./blog-upload";
import { CreateTaxonomyDialog } from "./create-taxonomy-dialog";
import { EditorCanvas } from "./editor-canvas";

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartiqliving.com";

const BlogFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."),
  excerpt: z.string().trim().min(1, "Excerpt is required."),
  coverImage: z.string().trim(),
  coverImageAlt: z.string().trim(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string(),
  authorId: z.string().trim().min(1, "Choose an author."),
  categoryId: z.string().trim(),
  metaTitle: z.string().trim(),
  metaDescription: z.string().trim(),
  ogImage: z.string().trim(),
  ctaTitle: z.string().trim(),
  ctaDescription: z.string().trim(),
  ctaLabel: z.string().trim(),
  ctaHref: z
    .string()
    .trim()
    // Rendered straight into an anchor, so only site paths and https URLs.
    .refine((value) => !value || /^(\/|https:\/\/)/i.test(value), {
      message: "Use a site path like /solutions#whole-home, or an https URL.",
    }),
});

type BlogFormValues = z.infer<typeof BlogFormSchema>;

function buildDefaultValues(post: BlogPostDetail | null, authors: BlogAuthorRow[]): BlogFormValues {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    coverImage: post?.coverImage ?? "",
    coverImageAlt: post?.coverImageAlt ?? "",
    status: post?.status ?? "DRAFT",
    publishedAt: toDateTimeLocal(post?.publishedAt ?? null),
    // Default to the only author when there is exactly one, so a first post
    // does not fail validation for a field the editor never noticed.
    authorId: post?.author.id ?? (authors.length === 1 ? authors[0].id : ""),
    categoryId: post?.category?.id ?? "",
    metaTitle: post?.metaTitle ?? "",
    metaDescription: post?.metaDescription ?? "",
    ogImage: post?.ogImage ?? "",
    ctaTitle: post?.ctaTitle ?? "",
    ctaDescription: post?.ctaDescription ?? "",
    ctaLabel: post?.ctaLabel ?? "",
    ctaHref: post?.ctaHref ?? "",
  };
}

interface BlogEditorProps {
  post: BlogPostDetail | null;
  categories: BlogCategoryRow[];
  authors: BlogAuthorRow[];
}

export function BlogEditor({ post, categories, authors }: BlogEditorProps) {
  const router = useRouter();
  const editorRef = useRef<EditorJS | null>(null);

  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [authorOptions, setAuthorOptions] = useState(authors);
  const [creating, setCreating] = useState<"category" | "author" | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [uploadingCover, setUploadingCover] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(BlogFormSchema),
    defaultValues: buildDefaultValues(post, authors),
  });

  // Re-seed once the server data settles, keeping any edits already made.
  useEffect(() => {
    reset(buildDefaultValues(post, authors));
    setCategoryOptions(categories);
    setAuthorOptions(authors);
  }, [post, authors, categories, reset]);

  const title = watch("title");
  const status = watch("status");
  const publishedAt = watch("publishedAt");
  const coverImage = watch("coverImage");

  // Derive the slug from the title only while the editor has not touched it.
  useEffect(() => {
    if (slugTouched) return;
    setValue("slug", slugify(title));
  }, [title, slugTouched, setValue]);

  const scheduled =
    status === "PUBLISHED" && publishedAt.length > 0 && new Date(publishedAt).getTime() > Date.now();

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);

    try {
      const url = await uploadImageToR2(file);
      setValue("coverImage", url, { shouldDirty: true });
      toast.success("Cover image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cover upload failed.");
    } finally {
      setUploadingCover(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    let content: EditorJsDocument;

    try {
      const editor = editorRef.current;
      if (!editor) throw new Error("The editor is still loading. Try again in a moment.");

      // The document lives inside Editor.js, not in form state — reading it
      // here avoids re-rendering the editor on every keystroke.
      content = (await editor.save()) as EditorJsDocument;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to read the article content.");
      return;
    }

    const payload = {
      ...values,
      content,
      publishedAt: fromDateTimeLocal(values.publishedAt),
    };

    try {
      const response = await fetch(post ? `/api/blog/posts/${post.id}` : "/api/blog/posts", {
        method: post ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as {
        data?: BlogPostDetail;
        message?: string;
        errors?: string[];
      } | null;

      if (!response.ok) {
        throw new Error(body?.errors?.[0] ?? body?.message ?? "Unable to save the post.");
      }

      toast.success(post ? "Post updated" : "Post created");

      if (post) {
        router.refresh();
      } else if (body?.data?.id) {
        router.replace(`/dashboard/blog/${body.data.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save the post.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">{post ? "Edit post" : "New post"}</h1>
          <p className="text-muted-foreground text-sm">
            {post
              ? "Changes are not public until you save and the post is published."
              : "Write the article, then save it as a draft or publish straight away."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild type="button" variant="outline">
            <Link href="/dashboard/blog">Cancel</Link>
          </Button>
          {post && post.status === "PUBLISHED" && !scheduled ? (
            <Button asChild type="button" variant="outline">
              <a href={`${PUBLIC_SITE_URL}/blog/${post.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink />
                View
              </a>
            </Button>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : post ? "Save changes" : "Create post"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Canvas */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="post-title" className="sr-only">
              Title
            </Label>
            <Input
              id="post-title"
              className="h-auto border-0 px-0 font-semibold text-2xl tracking-tight shadow-none focus-visible:ring-0"
              placeholder="Post title"
              {...register("title")}
            />
            {errors.title ? <p className="text-destructive text-xs">{errors.title.message}</p> : null}
          </div>

          <div className="rounded-xl border bg-background p-4">
            <EditorCanvas
              initialData={post?.content ?? { blocks: [] }}
              editorRef={editorRef}
            />
          </div>
        </div>

        {/* Metadata */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <section className="grid gap-3 rounded-xl border bg-background p-4">
            <h2 className="font-medium text-sm">Publishing</h2>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="post-published">Published</Label>
                <p className="text-muted-foreground text-xs">
                  {scheduled ? "Scheduled — goes live at the date below." : "Drafts are hidden from the public site."}
                </p>
              </div>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Switch
                    id="post-published"
                    checked={field.value === "PUBLISHED"}
                    onCheckedChange={(checked) => field.onChange(checked ? "PUBLISHED" : "DRAFT")}
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-published-at">Publish date</Label>
              <Input id="post-published-at" type="datetime-local" {...register("publishedAt")} />
              <p className="text-muted-foreground text-xs">
                Leave blank to publish immediately. Set a future date to schedule.
              </p>
            </div>
          </section>

          <section className="grid gap-3 rounded-xl border bg-background p-4">
            <h2 className="font-medium text-sm">Organisation</h2>

            <div className="grid gap-2">
              <Label htmlFor="post-author">Author</Label>
              <div className="flex gap-2">
                <NativeSelect id="post-author" className="min-w-0 flex-1" {...register("authorId")}>
                  <NativeSelectOption value="">Choose an author…</NativeSelectOption>
                  {authorOptions.map((author) => (
                    <NativeSelectOption key={author.id} value={author.id}>
                      {author.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Add author"
                  onClick={() => setCreating("author")}
                >
                  <Plus />
                </Button>
              </div>
              {errors.authorId ? <p className="text-destructive text-xs">{errors.authorId.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-category">Category</Label>
              <div className="flex gap-2">
                <NativeSelect id="post-category" className="min-w-0 flex-1" {...register("categoryId")}>
                  <NativeSelectOption value="">No category</NativeSelectOption>
                  {categoryOptions.map((category) => (
                    <NativeSelectOption key={category.id} value={category.id}>
                      {category.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Add category"
                  onClick={() => setCreating("category")}
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-slug">Slug</Label>
              <Input
                id="post-slug"
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
              {errors.slug ? <p className="text-destructive text-xs">{errors.slug.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-excerpt">Excerpt</Label>
              <Textarea id="post-excerpt" rows={3} {...register("excerpt")} />
              {errors.excerpt ? <p className="text-destructive text-xs">{errors.excerpt.message}</p> : null}
            </div>
          </section>

          <section className="grid gap-3 rounded-xl border bg-background p-4">
            <h2 className="font-medium text-sm">Cover image</h2>

            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary R2 URL, not a Next-optimised asset
              <img
                src={coverImage}
                alt={watch("coverImageAlt") || "Cover preview"}
                className="aspect-[16/10] w-full rounded-lg border object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground text-xs">No cover image yet</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button asChild type="button" variant="outline" size="sm" disabled={uploadingCover}>
                <label htmlFor="post-cover-file" className="cursor-pointer">
                  <ImagePlus />
                  {uploadingCover ? "Uploading…" : coverImage ? "Replace" : "Upload"}
                </label>
              </Button>
              <input
                id="post-cover-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleCoverUpload(file);
                  event.target.value = "";
                }}
              />
              {coverImage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("coverImage", "", { shouldDirty: true })}
                >
                  Remove
                </Button>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-cover-alt">Cover alt text</Label>
              <Input id="post-cover-alt" {...register("coverImageAlt")} />
            </div>
          </section>

          <section className="grid gap-3 rounded-xl border bg-background p-4">
            <h2 className="font-medium text-sm">Call to action</h2>
            <p className="text-muted-foreground text-xs">
              Shown at the end of the article. Leave blank to use the site-wide default.
            </p>

            <div className="grid gap-2">
              <Label htmlFor="post-cta-label">Button label</Label>
              <Input id="post-cta-label" placeholder="Book a Consultation" {...register("ctaLabel")} />
              {errors.ctaLabel ? <p className="text-destructive text-xs">{errors.ctaLabel.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-cta-href">Button link</Label>
              <Input id="post-cta-href" placeholder="/solutions#whole-home" {...register("ctaHref")} />
              {errors.ctaHref ? <p className="text-destructive text-xs">{errors.ctaHref.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-cta-title">Heading</Label>
              <Input id="post-cta-title" {...register("ctaTitle")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-cta-description">Supporting text</Label>
              <Textarea id="post-cta-description" rows={3} {...register("ctaDescription")} />
            </div>
          </section>

          <section className="grid gap-3 rounded-xl border bg-background p-4">
            <h2 className="font-medium text-sm">Search listing</h2>
            <p className="text-muted-foreground text-xs">
              Optional. Falls back to the title and excerpt when left blank.
            </p>

            <div className="grid gap-2">
              <Label htmlFor="post-meta-title">Meta title</Label>
              <Input id="post-meta-title" {...register("metaTitle")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-meta-description">Meta description</Label>
              <Textarea id="post-meta-description" rows={3} {...register("metaDescription")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="post-og-image">Social share image URL</Label>
              <Input id="post-og-image" placeholder="Falls back to the cover image" {...register("ogImage")} />
            </div>
          </section>
        </aside>
      </div>

      <CreateTaxonomyDialog
        kind={creating ?? "category"}
        open={creating !== null}
        onOpenChange={(open) => !open && setCreating(null)}
        onCreated={(created) => {
          if ("slug" in created) {
            setCategoryOptions((current) => [...current, created as BlogCategoryRow]);
            setValue("categoryId", created.id);
          } else {
            setAuthorOptions((current) => [...current, created as BlogAuthorRow]);
            setValue("authorId", created.id);
          }
        }}
      />
    </form>
  );
}

export default BlogEditor;
