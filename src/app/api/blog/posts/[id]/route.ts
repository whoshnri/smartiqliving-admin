import { NextResponse } from "next/server";

import { apiErrorResponse, readJsonBody } from "@/lib/api-error";
import { adminApiDelete, adminApiPut } from "@/lib/api";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJsonBody(request);

  if (!body) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await adminApiPut(`blog/posts/${id}`, body);
    return NextResponse.json({ data });
  } catch (error) {
    return apiErrorResponse(error, "Unable to update post.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const data = await adminApiDelete(`blog/posts/${id}`);
    return NextResponse.json({ data });
  } catch (error) {
    return apiErrorResponse(error, "Unable to delete post.");
  }
}
