import { NextRequest, NextResponse } from "next/server";
import { databaseErrorResponse, unauthorizedResponse } from "@/lib/api/auth-response";
import { getCommunityContext } from "@/lib/supabase/community-context";
import { addCommunityPost, getCommunityPosts } from "@/lib/supabase/post-queries";
import { getFastAuthContext } from "@/lib/supabase/queries";
import { parseCommunityId, parsePostInput } from "@/lib/validation/post-schema";

const POST_TIMEOUT_MS = 10000;
const TIMEOUT = Symbol("timeout");

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
  const parsed = parsePostInput(await request.json().catch(() => ({})));
  if (!parsed.ok) return NextResponse.json({ error: "INVALID_INPUT", message: parsed.message }, { status: 400 });
  const context = await withTimeout(getFastAuthContext(), POST_TIMEOUT_MS);
  if (context === TIMEOUT) return NextResponse.json({ error: "TIMEOUT", message: "登录状态读取超时，请稍后重试。" }, { status: 503 });
  if (!context) return unauthorizedResponse();
  const result = await withTimeout(addCommunityPost(context, parsed.value), POST_TIMEOUT_MS);
  if (result === TIMEOUT) return NextResponse.json({ error: "TIMEOUT", message: "发帖请求超时，请稍后重试。" }, { status: 503 });
  if (result.error) return NextResponse.json({ error: "POST_ERROR", message: result.error }, { status: result.status ?? 503 });
  return NextResponse.json({ data: result.data }, { status: 201 });
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | typeof TIMEOUT> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<typeof TIMEOUT>((resolve) => {
    timer = setTimeout(() => resolve(TIMEOUT), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
