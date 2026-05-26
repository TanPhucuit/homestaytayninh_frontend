import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}

export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const origin = request.nextUrl.origin;
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.redirect(new URL("/login?error=supabase_env", origin));
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: next ? `${origin}/auth/callback?next=${encodeURIComponent(next)}` : `${origin}/auth/callback`
    }
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  const providerCheck = await fetch(data.url, { redirect: "manual", cache: "no-store" }).catch(() => null);
  if (providerCheck && providerCheck.status >= 400) {
    const body = await providerCheck.text().catch(() => "");
    if (body.includes("Unsupported provider") || body.includes("provider is not enabled")) {
      return NextResponse.redirect(new URL("/login?error=provider_disabled", origin));
    }
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  return NextResponse.redirect(data.url);
}
