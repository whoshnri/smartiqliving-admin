import { NextResponse } from "next/server";

import { apiErrorResponse, readJsonBody } from "@/lib/api-error";
import { adminApiPost } from "@/lib/api";

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await adminApiPost("blog/uploads/presign", body);
    return NextResponse.json({ data });
  } catch (error) {
    return apiErrorResponse(error, "Unable to prepare the upload.");
  }
}
