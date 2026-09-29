import { cookies } from "next/headers";

import { type AdminRole, verifyAdminToken } from "@/lib/jwt";

export const SESSION_COOKIE = "smartiq_admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<AdminSession | null> {
  const payload = verifyAdminToken(await getSessionToken());

  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
