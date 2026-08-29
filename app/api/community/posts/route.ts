import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, unauthorizedResponse } from "@/lib/api/auth-response";
import { getCommunityContext } from "@/lib/supabase/community-context";
import { addCommunityPost, getCommunityPosts } from "@/lib/supabase/post-queries";
import { getAuthContext } from "@/lib/supabase/queries";
import { parseCommunityId, parsePostInput } from "@/lib/validation/post-schema";

// 游客可以读取公开帖子；likedByMe 只有登录用户才会返回 true。
export async function GET(request: NextRequest) {
  const parsed = parseCommunityId(request.nextUrl.searchParams.get("communityId"));
  if (!parsed.ok) return NextResponse.json({ error: "INVALID_INPUT", message: parsed.message }, { status: 400 });
  const context = await getCommunityContext();
  const result = await getCommunityPosts(context, parsed.value);
  if (result.error) return databaseErrorResponse(result.error);
  return NextResponse.json({ data: result.data, viewer: { isLoggedIn: Boolean(context.user) } });
}

export async function POST(request: NextRequest) {
  const context = await getAuthContext();
  if (!context) return unauthorizedResponse();
  const parsed = parsePostInput(await request.json().catch(() => ({})));
  if (!parsed.ok) return NextResponse.json({ error: "INVALID_INPUT", message: parsed.message }, { status: 400 });
  const result = await addCommunityPost(context, parsed.value);
  if (result.error) return NextResponse.json({ error: "POST_ERROR", message: result.error }, { status: result.status ?? 503 });
  return NextResponse.json({ data: result.data }, { status: 201 });
}
