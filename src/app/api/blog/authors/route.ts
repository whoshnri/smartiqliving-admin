import { NextResponse } from "next/server";

import { apiErrorResponse, readJsonBody } from "@/lib/api-error";
import { adminApiPost } from "@/lib/api";

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await adminApiPost("blog/authors", body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Unable to create author.");
  }
}
