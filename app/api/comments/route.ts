import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, unauthorizedResponse } from "@/lib/api/auth-response";
import { getArticleComments, addComment, markCommentDeleted } from "@/lib/supabase/comment-queries";
import { getCommunityContext } from "@/lib/supabase/community-context";
import { getAuthContext } from "@/lib/supabase/queries";
import { parseCommentId, parseCommentInput } from "@/lib/validation/comment-schema";

// 游客可以读取公开评论；登录用户还能看到自己的待审核评论。
export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get("articleId")?.trim();
  if (!articleId) return NextResponse.json({ error: "INVALID_INPUT", message: "缺少文章 ID。" }, { status: 400 });
  const context = await getCommunityContext();
  const result = await getArticleComments(context, articleId);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data, viewer: { isLoggedIn: Boolean(context.user) } });
}

// 新评论默认进入 pending，审核通过前只有作者自己能看到。
export async function POST(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const parsed = parseCommentInput(await request.json().catch(() => ({})));
  if (!parsed.ok) return NextResponse.json({ error: "INVALID_INPUT", message: parsed.message }, { status: 400 });
  const result = await addComment(context, parsed.value);
  if (result.error) return NextResponse.json({ error: "COMMENT_ERROR", message: result.error }, { status: result.status ?? 503 });
  return NextResponse.json({ data: result.data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const parsed = parseCommentId(request.nextUrl.searchParams.get("id"));
  if (!parsed.ok) return NextResponse.json({ error: "INVALID_INPUT", message: parsed.message }, { status: 400 });
  const result = await markCommentDeleted(context, parsed.value);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data });
}
