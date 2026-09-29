import { NextResponse } from "next/server";

import { adminApiPost } from "@/lib/api";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await adminApiPost("case-studies", body);
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create case study." }, { status: 502 });
  }
}
