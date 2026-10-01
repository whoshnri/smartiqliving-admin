import { NextResponse } from "next/server";

import { ApiResponseError } from "@/lib/api";

/**
 * Keeps the API's own status codes intact — a 409 from the API stays a 409 —
 * and only falls back to 502 when the failure was on the wire. The older
 * case-study proxies flatten everything to 502, which hides real conflicts
 * from the user.
 */
export function apiErrorResponse(error: unknown, fallback: string) {
  if (error instanceof ApiResponseError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: fallback }, { status: 502 });
}

/** Shared body parser so each route does not repeat the same try/catch. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
