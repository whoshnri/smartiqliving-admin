"use server";

import { cookies } from "next/headers";

export async function getPreference(key: string) {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
}

export async function setValueToCookie(key: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(key, value, { path: "/" });
}
