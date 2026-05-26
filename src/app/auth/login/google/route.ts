import { NextRequest, NextResponse } from "next/server";
import { OAUTH_NEXT_COOKIE_NAME, OAUTH_STATE_COOKIE_NAME } from "@/lib/session-cookie";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.redirect(new URL("/login?error=google_env", origin));

  const state = crypto.randomUUID();
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const redirectUri = `${origin}/auth/callback`;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, cookieOptions(600));
  response.cookies.set(OAUTH_NEXT_COOKIE_NAME, next, cookieOptions(600));
  return response;
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge
  };
}
