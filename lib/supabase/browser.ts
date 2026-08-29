import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseConfig } from "@/lib/supabase/config";

// 浏览器端 client 只使用公开 key，适合登录、读取公开数据等浏览器操作。
export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, publishableKey } = assertSupabaseConfig();
  return createBrowserClient(url, publishableKey);
}
