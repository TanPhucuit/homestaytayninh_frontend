import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { homeForRole, parseRole } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return NextResponse.redirect(new URL("/login?error=supabase_env", request.nextUrl.origin));
    }
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "https://homestaytayninh-backend.onrender.com").replace(/\/$/, "");
      if (data.session?.access_token) {
        const profileResponse = await fetch(`${apiUrl}/api/auth/me`, {
          cache: "no-store",
          headers: { authorization: `Bearer ${data.session.access_token}` }
        }).catch(() => null);
        if (profileResponse?.ok) {
          const profile = (await profileResponse.json()) as { role?: string };
          const role = parseRole(profile.role);
          if (role) {
            return NextResponse.redirect(new URL(homeForRole(role), request.nextUrl.origin));
          }
        }
      }

      return NextResponse.redirect(new URL("/login?error=role_lookup", request.nextUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", request.nextUrl.origin));
}
