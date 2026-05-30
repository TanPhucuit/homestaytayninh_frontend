import { NextRequest, NextResponse } from "next/server";
import { homeForRole, parseRole } from "@/lib/rbac";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

type BackendLoginResponse = {
  sessionToken?: string;
  expiresAt?: string;
  redirectTo?: string;
  role?: string;
  user?: { role?: string };
};

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const formData = await request.formData();
  const email = normalizeDemoLoginEmail(String(formData.get("email") ?? "").trim());
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!apiUrl) return NextResponse.redirect(new URL(`/login?error=api_env&next=${encodeURIComponent(next)}`, origin));
  if (!email || !password) return NextResponse.redirect(new URL(`/login?error=password_required&next=${encodeURIComponent(next)}`, origin));

  const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password })
  }).catch(() => null);

  if (!loginResponse?.ok) {
    return NextResponse.redirect(new URL(`/login?error=password_login&next=${encodeURIComponent(next)}`, origin));
  }

  const login = (await loginResponse.json()) as BackendLoginResponse;
  const role = parseRole(login.user?.role ?? login.role) ?? "CUSTOMER";
  if (!login.sessionToken) return NextResponse.redirect(new URL(`/login?error=role_lookup&next=${encodeURIComponent(next)}`, origin));

  const target = next === "/" ? login.redirectTo || homeForRole(role) : next;
  const response = NextResponse.redirect(new URL(target, origin));
  response.cookies.set(SESSION_COOKIE_NAME, login.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: login.expiresAt ? new Date(login.expiresAt) : undefined,
    maxAge: login.expiresAt ? undefined : 60 * 60 * 24 * 7
  });
  return response;
}

function safeNext(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function normalizeDemoLoginEmail(value: string) {
  const key = value.toLowerCase();
  const aliases: Record<string, string> = {
    staffdemo: "staff.demo@homestay.local",
    "staffdemo@gmail.com": "staff.demo@homestay.local",
    ownerstaffdemo: "ownerstaff.demo@homestay.local",
    "ownerstaffdemo@gmail.com": "ownerstaff.demo@homestay.local"
  };
  return aliases[key] ?? value;
}
