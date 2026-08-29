import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseSessionCookie } from "@/lib/supabase/session";

export type CommunityContext = {
  client: SupabaseClient;
  user: User | null;
};

// 评论列表允许游客读取，所以这里返回“可能没有用户”的上下文。
export async function getCommunityContext(): Promise<CommunityContext> {
  const cookieStore = await cookies();
  if (!hasSupabaseSessionCookie(cookieStore)) {
    const client = await createSupabaseServerClient(cookieStore);
    return { client, user: null };
  }
  const client = await createSupabaseServerClient(cookieStore);
  const { data } = await client.auth.getUser();
  return { client, user: data.user ?? null };
}
