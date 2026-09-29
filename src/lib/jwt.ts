import type { AdminRole } from "@/types";

import crypto from "node:crypto";

export type { AdminRole };

export type AdminTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
};

/**
 * Mirrors api/lib/jwt.ts. Both services share ADMIN_JWT_SECRET, so the CRM can
 * validate a session without calling the API on every request.
 */
export function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET ?? "dev-jwt-secret-change-me";
}

function sign(data: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function verifyAdminToken(token?: string | null): AdminTokenPayload | null {
  if (!token) return null;

  const [header, claims, signature] = token.split(".");
  if (!header || !claims || !signature) return null;

  const expected = sign(`${header}.${claims}`, getJwtSecret());
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  let body: Record<string, unknown>;

  try {
    body = JSON.parse(Buffer.from(claims, "base64url").toString());
  } catch {
    return null;
  }

  if (body.iss !== "smartiqliving-admin") return null;
  if (typeof body.exp !== "number" || body.exp * 1000 < Date.now()) return null;

  const { sub, email, name, role } = body;
  if (typeof sub !== "string" || typeof email !== "string") return null;
  if (role !== "SUPERUSER" && role !== "ADMIN") return null;

  return {
    sub,
    email,
    name: typeof name === "string" ? name : email,
    role,
  };
}
