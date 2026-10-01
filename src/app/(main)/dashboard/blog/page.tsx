import type { Metadata } from "next";

import { adminApiGet } from "@/lib/api";
import type { BlogPostRow } from "@/types";

import { BlogTable, type BlogListRow } from "./_components/blog-table";

export const metadata: Metadata = {
  title: "Blog | SmartIQLiving Admin",
};

/**
 * "Scheduled" is presentation-only: the API stores an ordinary PUBLISHED post
 * whose `publishedAt` simply has not arrived yet. Resolving it here keeps the
 * table from calling `Date.now()` during render, which would render differently
 * on the server and the client.
 */
function toListRows(posts: BlogPostRow[]): BlogListRow[] {
  const now = Date.now();

  return posts.map((post) => ({
    ...post,
    displayStatus:
      post.status !== "PUBLISHED"
        ? "Draft"
        : post.publishedAt && new Date(post.publishedAt).getTime() > now
          ? "Scheduled"
          : "Published",
  }));
}

export default async function BlogPage() {
  const posts = await adminApiGet<BlogPostRow[]>("blog/posts");

  return <BlogTable data={toListRows(posts)} />;
}
