import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseConfig } from "@/lib/supabase/config";

// 服务端 client 通过 cookies 读取登录会话，页面和 Route Handler 不需要自己处理 cookie。
type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function createSupabaseServerClient(cookieStore?: CookieStore): Promise<SupabaseClient> {
  const resolvedCookieStore = cookieStore ?? await cookies();
  const { url, publishableKey } = assertSupabaseConfig();
  const setAll: SetAllCookies = (cookiesToSet) => {
    try {
      cookiesToSet.forEach(({ name, value, options }) => {
        resolvedCookieStore.set(name, value, options);
      });
    } catch {
      // Server Component 可能不能写 cookie；Middleware 会负责刷新会话。
    }
  };

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return resolvedCookieStore.getAll();
      },
      setAll,
    },
  });
}

// Service Role key 拥有更高权限，只允许未来的服务端任务显式调用这个工厂。
// 浏览器端代码不应导入本函数，普通页面查询应继续使用上面的用户会话 client。
export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}
