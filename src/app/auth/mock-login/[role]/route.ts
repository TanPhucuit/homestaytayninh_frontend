import { NextRequest, NextResponse } from "next/server";
import { homeForRole, normalizeRole } from "@/lib/rbac";

export async function GET(request: NextRequest, context: { params: Promise<{ role: string }> }) {
  const { role: rawRole } = await context.params;
  const role = normalizeRole(rawRole);
  const response = NextResponse.redirect(new URL(homeForRole(role), request.url));

  response.cookies.set("demo-role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return response;
}

