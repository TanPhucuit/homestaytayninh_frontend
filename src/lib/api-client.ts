import { UserRole } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public path?: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ApiEnvelope<T> = { data?: T; error?: string; message?: string; success?: boolean };

const userIdForRole: Record<UserRole, string> = {
  CUSTOMER: "u-customer",
  OWNER: "u-owner",
  OWNER_STAFF: "u-owner-staff",
  STAFF: "u-staff",
  ADMIN: "u-admin"
};

function unwrapResponse<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

type NextRequestInit = RequestInit & { next?: { revalidate?: number } };

async function apiFetch<T>(path: string, role: UserRole, init?: NextRequestInit): Promise<T> {
  if (!API_URL) {
    throw new ApiClientError("NEXT_PUBLIC_API_URL is not configured; using mock data source.", undefined, path);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    ...(init?.next ? { next: init.next } : {}),
    headers: {
      "content-type": "application/json",
      "x-user-id": userIdForRole[role],
      "x-user-role": role,
      ...(init?.headers ?? {})
    }
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const envelope = payload as ApiEnvelope<unknown>;
    throw new ApiClientError(envelope?.error ?? envelope?.message ?? `API request failed with ${response.status}`, response.status, path);
  }

  return unwrapResponse<T>(payload);
}

export async function apiGet<T>(path: string, role: UserRole = "CUSTOMER", init?: NextRequestInit): Promise<T> {
  return apiFetch<T>(path, role, {
    ...init,
    method: "GET",
    next: { revalidate: 15, ...(init?.next ?? {}) }
  });
}

export async function apiMutation<T>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown, role: UserRole = "ADMIN"): Promise<T> {
  return apiFetch<T>(path, role, {
    method,
    cache: "no-store",
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

export async function withMockFallback<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await request();
  } catch {
    return fallback;
  }
}
