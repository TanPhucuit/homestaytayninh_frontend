import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { homeForRole, normalizeRole } from "@/lib/rbac";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return NextResponse.redirect(new URL("/login?error=supabase_env", request.nextUrl.origin));
    }
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next) return NextResponse.redirect(new URL(next, request.nextUrl.origin));

      const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "https://homestaytayninh-backend.onrender.com").replace(/\/$/, "");
      if (data.session?.access_token) {
        const profileResponse = await fetch(`${apiUrl}/api/auth/me`, {
          cache: "no-store",
          headers: { authorization: `Bearer ${data.session.access_token}` }
        }).catch(() => null);
        if (profileResponse?.ok) {
          const profile = (await profileResponse.json()) as { role?: string };
          return NextResponse.redirect(new URL(homeForRole(normalizeRole(profile.role)), request.nextUrl.origin));
        }
      }

      return NextResponse.redirect(new URL("/homestays", request.nextUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", request.nextUrl.origin));
}
