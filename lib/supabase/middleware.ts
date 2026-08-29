import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

// Middleware 的职责是把刷新后的 Supabase cookie 写回响应，页面本身无需感知刷新过程。
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();
  const setAll: SetAllCookies = (cookiesToSet) => {
    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
    response = NextResponse.next({ request });
    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  };

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll,
    },
  });

  await supabase.auth.getUser();
  return response;
}
