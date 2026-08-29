import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, unauthorizedResponse } from "@/lib/api/auth-response";
import { addFollow, getAuthContext, getMyFollows, removeFollow } from "@/lib/supabase/queries";
import type { FollowTargetType } from "@/types/user";

const targetTypes: FollowTargetType[] = ["team", "player", "match"];

export async function GET() {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const result = await getMyFollows(context);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data });
}

export async function POST(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const body = await request.json().catch(() => ({}));
  if (!targetTypes.includes(body.targetType) || typeof body.targetId !== "string" || typeof body.targetName !== "string") return NextResponse.json({ error: "INVALID_INPUT", message: "关注对象信息不完整。" }, { status: 400 });
  const result = await addFollow(context, body);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "INVALID_INPUT", message: "缺少关注记录 ID。" }, { status: 400 });
  const result = await removeFollow(context, id);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: { id } });
}
