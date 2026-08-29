import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, unauthorizedResponse } from "@/lib/api/auth-response";
import { getAuthContext, getMyProfile, saveMyProfile } from "@/lib/supabase/queries";

// GET 返回当前用户资料，底部导航也用它判断主队是否已选择。
export async function GET() {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const result = await getMyProfile(context);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data, email: context.user.email ?? null });
}

// PATCH 同时支持选择主队和跳过主队；主队 ID 为空代表用户明确跳过。
export async function PATCH(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const body = await request.json().catch(() => ({}));
  const mainTeamId = typeof body.mainTeamId === "string" && body.mainTeamId.trim() ? body.mainTeamId.trim() : null;
  const result = await saveMyProfile(context, mainTeamId, true);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data });
}
