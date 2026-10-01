import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { BlogAuthorRow, BlogCategoryRow } from "@/types";

import { BlogEditorLoader } from "../_components/blog-editor-loader";

export const metadata: Metadata = {
  title: "New post | SmartIQLiving Admin",
};

export default async function NewBlogPostPage() {
  const [categories, authors] = await Promise.all([
    adminApiGet<BlogCategoryRow[]>("blog/categories"),
    adminApiGet<BlogAuthorRow[]>("blog/authors"),
  ]);

  return <BlogEditorLoader post={null} categories={categories} authors={authors} />;
}
