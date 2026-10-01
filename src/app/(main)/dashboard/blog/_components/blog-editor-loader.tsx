"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import type { BlogAuthorRow, BlogCategoryRow, BlogPostDetail } from "@/types";

function EditorSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-[28rem] w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Editor.js touches `document` as soon as it is constructed and would break a
 * server render, so the editor is imported for the browser only. Doing it here
 * — rather than inside `blog-editor.tsx` — also keeps the date fields from
 * formatting against the server's timezone and tripping hydration.
 */
const BlogEditor = dynamic(() => import("./blog-editor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

interface BlogEditorLoaderProps {
  post: BlogPostDetail | null;
  categories: BlogCategoryRow[];
  authors: BlogAuthorRow[];
}

export function BlogEditorLoader({ post, categories, authors }: BlogEditorLoaderProps) {
  return <BlogEditor post={post} categories={categories} authors={authors} />;
}
