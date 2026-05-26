import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (token && apiUrl) {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      cache: "no-store",
      headers: { authorization: `Bearer ${token}` }
    }).catch(() => null);
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
