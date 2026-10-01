import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { adminApiGet, adminApiGetOrNull } from "@/lib/api";
import type { BlogAuthorRow, BlogCategoryRow, BlogPostDetail } from "@/types";

import { BlogEditorLoader } from "../_components/blog-editor-loader";

export const metadata: Metadata = {
  title: "Edit post | SmartIQLiving Admin",
};

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [post, categories, authors] = await Promise.all([
    adminApiGetOrNull<BlogPostDetail>(`blog/posts/${id}`),
    adminApiGet<BlogCategoryRow[]>("blog/categories"),
    adminApiGet<BlogAuthorRow[]>("blog/authors"),
  ]);

  if (!post) notFound();

  return <BlogEditorLoader post={post} categories={categories} authors={authors} />;
}
