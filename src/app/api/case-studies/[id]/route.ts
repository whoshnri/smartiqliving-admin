import { NextResponse } from "next/server";

import { adminApiPut } from "@/lib/api";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await adminApiPut(`case-studies/${id}`, body);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ message: "Unable to update case study." }, { status: 502 });
  }
}
