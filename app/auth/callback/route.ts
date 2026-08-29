import { NextRequest, NextResponse } from "next/server";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { getAuthContext, getMyProfile } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 回调路由把邮件中的 code 换成 Cookie 会话，再决定是否进入首次主队设置。
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  if (!code) return redirectToLogin(request, "missing_code");
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) return redirectToLogin(request, "callback_failed");
  const context = await getAuthContext();
  if (!context) return redirectToLogin(request, "session_missing");
  const profile = await getMyProfile(context);
  if (profile.error) return redirectToLogin(request, "profile_unavailable");
  const needsSetup = !profile.data || !profile.data.hasCompletedOnboarding;
  const destination = needsSetup ? `/club/select?next=${encodeURIComponent(nextPath)}` : nextPath;
  return NextResponse.redirect(new URL(destination, request.url));
}

function redirectToLogin(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/auth/login?error=${error}`, request.url));
}
