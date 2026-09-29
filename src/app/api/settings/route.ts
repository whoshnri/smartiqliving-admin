import { NextResponse } from "next/server";

import { adminApiPut } from "@/lib/api";

export async function PUT(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const data = await adminApiPut("settings", body);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ message: "Unable to update settings." }, { status: 502 });
  }
}
