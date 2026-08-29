import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, unauthorizedResponse } from "@/lib/api/auth-response";
import { getCommunityContext } from "@/lib/supabase/community-context";
import { addLike, addReport, getLikeState, removeLike } from "@/lib/supabase/interaction-queries";
import { getAuthContext } from "@/lib/supabase/queries";
import { parseLikeInput, parseLikeQuery, parseReportInput } from "@/lib/validation/interaction-schema";

// 点赞数量可以公开读取，当前用户是否已点赞取决于登录 Cookie。
export async function GET(request: NextRequest) {
  const parsed = parseLikeQuery(request.nextUrl.searchParams);
  if (!parsed.ok) return NextResponse.json({ error: "INVALID_INPUT", message: parsed.message }, { status: 400 });
  const context = await getCommunityContext();
  const result = await getLikeState(context, parsed.value);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data });
}

// POST 同时承接点赞和举报；是否是举报由 commentId 字段判断。
export async function POST(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const body = await request.json().catch(() => ({}));
  const report = parseReportInput(body);
  if (report.ok) {
    const result = await addReport(context, report.value);
    if (result.error) return databaseErrorResponse(result.error);
    return NextResponse.json({ data: result.data, duplicate: result.duplicate }, { status: result.duplicate ? 200 : 201 });
  }
  const like = parseLikeInput(body);
  if (!like.ok) return NextResponse.json({ error: "INVALID_INPUT", message: like.message }, { status: 400 });
  const result = await addLike(context, like.value);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const parsed = parseLikeQuery(request.nextUrl.searchParams);
  if (!parsed.ok) return NextResponse.json({ error: "INVALID_INPUT", message: parsed.message }, { status: 400 });
  const result = await removeLike(context, parsed.value);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data });
}
