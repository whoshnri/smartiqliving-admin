import { NextResponse } from "next/server";

import { ApiResponseError, adminApiPost } from "@/lib/api";

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ApiResponseError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: fallback }, { status: 502 });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await adminApiPost("users", body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Unable to add this admin.");
  }
}
