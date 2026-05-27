import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./session-cookie";
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

function unwrapResponse<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

type NextRequestInit = RequestInit & { next?: { revalidate?: number } };

async function authHeaders(): Promise<HeadersInit> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, _role: UserRole, init?: NextRequestInit): Promise<T> {
  if (!API_URL) {
    throw new ApiClientError("Hệ thống chưa sẵn sàng. Vui lòng thử lại sau.", undefined, path);
  }

  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  const requestAuthHeaders = await authHeaders();
  new Headers(requestAuthHeaders).forEach((value, key) => headers.set(key, value));

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    ...(init?.next ? { next: init.next } : {}),
    headers
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const envelope = payload as ApiEnvelope<unknown>;
    throw new ApiClientError(envelope?.error ?? envelope?.message ?? "Không thể tiếp tục, vui lòng thử lại.", response.status, path);
  }

  return unwrapResponse<T>(payload);
}

export async function apiGet<T>(path: string, role: UserRole = "CUSTOMER", init?: NextRequestInit): Promise<T> {
  const noStore = init?.cache === "no-store";
  return apiFetch<T>(path, role, {
    ...init,
    method: "GET",
    ...(noStore ? { cache: "no-store" } : { next: { revalidate: 15, ...(init?.next ?? {}) } })
  });
}

export async function apiMutation<T>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown, role: UserRole = "ADMIN"): Promise<T> {
  return apiFetch<T>(path, role, {
    method,
    cache: "no-store",
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}
