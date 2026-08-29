import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Middleware 只保留给 Supabase 登录回调，避免常规页面和 API 反复刷新会话。
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/auth/callback"],
};
