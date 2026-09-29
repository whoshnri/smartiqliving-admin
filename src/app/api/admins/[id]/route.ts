import { NextResponse } from "next/server";

import { ApiResponseError, adminApiDelete, adminApiPatch } from "@/lib/api";

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ApiResponseError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: fallback }, { status: 502 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await adminApiPatch(`users/${id}`, body);
    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error, "Unable to update this admin.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const data = await adminApiDelete(`users/${id}`);
    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error, "Unable to delete this admin.");
  }
}
