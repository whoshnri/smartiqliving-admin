import { cookies } from "next/headers";

import { type AdminSession, SESSION_COOKIE } from "@/lib/auth";
import { verifyAdminToken } from "@/lib/jwt";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5050";

export class ApiResponseError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiResponseError";
    this.status = status;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    throw new ApiResponseError(401, "Not signed in.");
  }

  return { authorization: `Bearer ${token}` };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();

  const response = await fetch(`${API_BASE_URL}/admin/${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new ApiResponseError(401, "Your session has expired. Please sign in again.");
  }

  if (response.status === 403) {
    throw new ApiResponseError(403, "You do not have access to this action.");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiResponseError(response.status, payload?.message ?? `Request to ${path} failed.`);
  }

  const payload = (await response.json()) as { data: T };
  return payload.data;
}

export async function adminApiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function adminApiGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await request<T>(path);
  } catch (error) {
    if (error instanceof ApiResponseError && error.status === 404) return null;
    throw error;
  }
}

export async function adminApiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function adminApiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function adminApiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function adminApiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

/**
 * Sign-in is the one call that cannot carry a session, so it talks to the API
 * directly rather than through the authed helpers above.
 */
export async function adminApiLogin(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as { data?: { token: string }; message?: string } | null;

  if (!response.ok || !payload?.data?.token) {
    throw new ApiResponseError(response.status, payload?.message ?? "Unable to sign in.");
  }

  return payload.data.token;
}

/**
 * Confirms the cookie session against the API so a revoked or deactivated
 * account cannot keep browsing. Falls back to the locally verified token when
 * the API is unreachable, so a hiccup does not sign people out.
 */
export async function getVerifiedSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const payload = verifyAdminToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!payload) return null;

  try {
    const me = await adminApiGet<AdminSession>("auth/me");
    return { id: me.id, email: me.email, name: me.name, role: me.role };
  } catch (error) {
    if (error instanceof ApiResponseError && (error.status === 401 || error.status === 403)) {
      return null;
    }

    return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  }
}
