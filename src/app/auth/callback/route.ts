import { NextRequest, NextResponse } from "next/server";
import { homeForRole, parseRole } from "@/lib/rbac";
import { OAUTH_NEXT_COOKIE_NAME, OAUTH_STATE_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/session-cookie";

type BackendLoginResponse = {
  sessionToken?: string;
  expiresAt?: string;
  redirectTo?: string;
  role?: string;
  user?: { role?: string };
};

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithClearedOAuthCookies(request, "/login?error=callback");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/auth/callback`;
  if (!clientId || !clientSecret) return redirectWithClearedOAuthCookies(request, "/login?error=google_env");
  if (!apiUrl) return redirectWithClearedOAuthCookies(request, "/login?error=api_env");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    })
  }).catch(() => null);

  if (!tokenResponse?.ok) return redirectWithClearedOAuthCookies(request, "/login?error=oauth");
  const tokenPayload = (await tokenResponse.json()) as { id_token?: string };
  if (!tokenPayload.id_token) return redirectWithClearedOAuthCookies(request, "/login?error=oauth");

  const loginResponse = await fetch(`${apiUrl}/api/auth/google-login`, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken: tokenPayload.id_token })
  }).catch(() => null);

  if (!loginResponse?.ok) {
    const suffix = loginResponse ? `&status=${loginResponse.status}` : "";
    return redirectWithClearedOAuthCookies(request, `/login?error=google_verify${suffix}`);
  }
  const login = (await loginResponse.json()) as BackendLoginResponse;
  const role = parseRole(login.user?.role ?? login.role) ?? "CUSTOMER";
  if (!login.sessionToken) return redirectWithClearedOAuthCookies(request, "/login?error=role_lookup");

  const next = safeNext(request.cookies.get(OAUTH_NEXT_COOKIE_NAME)?.value);
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
  response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
  response.cookies.delete(OAUTH_NEXT_COOKIE_NAME);
  return response;
}

function redirectWithClearedOAuthCookies(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.nextUrl.origin));
  response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
  response.cookies.delete(OAUTH_NEXT_COOKIE_NAME);
  return response;
}

function safeNext(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
