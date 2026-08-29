import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/queries";

// 退出登录由服务端清理 Supabase 会话，避免只清理前端状态造成假退出。
export async function POST() {
  const context = await getAuthContext();
  if (context) await context.client.auth.signOut();
  return NextResponse.json({ data: { signedOut: true } });
}
