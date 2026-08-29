import type { AuthContext } from "@/lib/supabase/queries";
import type { CommunityContext } from "@/lib/supabase/community-context";
import type { CommentInput, CommentRecord } from "@/types/community";

type Row = Record<string, any>;
type QueryResult<T> = { data: T; error?: string; status?: number };

// 读取单篇文章评论；RLS 会自动隐藏非作者的待审核评论。
export async function getArticleComments(context: CommunityContext, articleId: string): Promise<QueryResult<CommentRecord[]>> {
  const { data, error } = await context.client.from("comments").select("*").eq("article_id", articleId).order("created_at", { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: await attachLikes(context, data ?? []) };
}

// 社区首页只展示公开通过的一级评论，避免把待审核内容放到公共流里。
export async function getRecentComments(context: CommunityContext, limit = 10): Promise<QueryResult<CommentRecord[]>> {
  const { data, error } = await context.client.from("comments").select("*").eq("status", "approved").is("parent_id", null).order("created_at", { ascending: false }).limit(limit);
  if (error) return { data: [], error: error.message };
  return { data: await attachLikes(context, data ?? []) };
}

export async function getMyComments(context: AuthContext): Promise<QueryResult<CommentRecord[]>> {
  const publicContext = { client: context.client, user: context.user };
  const { data, error } = await context.client.from("comments").select("*").eq("user_id", context.user.id).order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: await attachLikes(publicContext, data ?? [], false) };
}

export async function addComment(context: AuthContext, input: CommentInput): Promise<QueryResult<CommentRecord | null>> {
  const parentCheck = input.parentId ? await validateParent(context, input) : undefined;
  if (parentCheck?.error) return { data: null, error: parentCheck.error, status: 400 };
  const { data, error } = await context.client.from("comments").insert({
    article_id: input.articleId,
    parent_id: input.parentId ?? null,
    user_id: context.user.id,
    author_name: displayName(context.user.email),
    content: input.content,
  }).select().single();
  if (error) return { data: null, error: error.message };
  return { data: mapComment(data, context.user.id, 0, false) };
}

export async function markCommentDeleted(context: AuthContext, id: string): Promise<QueryResult<CommentRecord | null>> {
  const { data, error } = await context.client.from("comments").update({ status: "deleted", updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", context.user.id).select().maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data ? mapComment(data, context.user.id, 0, false) : null };
}

async function validateParent(context: AuthContext, input: CommentInput) {
  const { data, error } = await context.client.from("comments").select("id,article_id,parent_id,status").eq("id", input.parentId).maybeSingle();
  if (error) return { error: error.message };
  if (!data || data.article_id !== input.articleId || data.parent_id || data.status === "deleted") {
    return { error: "只能回复同一篇文章下的一层评论。" };
  }
  return {};
}

async function attachLikes(context: CommunityContext, rows: Row[], asTree = true) {
  const ids = rows.map((row) => String(row.id));
  const { data } = ids.length
    ? await context.client.from("likes").select("target_id,user_id").eq("target_type", "comment").in("target_id", ids)
    : { data: [] };
  const countMap = new Map<string, number>();
  const likedSet = new Set<string>();
  (data ?? []).forEach((like: Row) => {
    const targetId = String(like.target_id);
    countMap.set(targetId, (countMap.get(targetId) ?? 0) + 1);
    if (context.user?.id === like.user_id) likedSet.add(targetId);
  });
  const mapped = rows.map((row) => mapComment(row, context.user?.id, countMap.get(row.id) ?? 0, likedSet.has(row.id)));
  return asTree ? buildTree(mapped) : mapped;
}

function buildTree(comments: CommentRecord[]) {
  const map = new Map(comments.map((comment) => [comment.id, { ...comment, replies: [] as CommentRecord[] }]));
  const roots: CommentRecord[] = [];
  map.forEach((comment) => {
    const parent = comment.parentId ? map.get(comment.parentId) : undefined;
    if (parent) parent.replies.push(comment);
    else roots.push(comment);
  });
  return roots;
}

function mapComment(row: Row, userId: string | undefined, likeCount: number, likedByMe: boolean): CommentRecord {
  return { id: row.id, articleId: row.article_id, parentId: row.parent_id ?? undefined, authorName: row.author_name, content: row.content, status: row.status, isOwn: row.user_id === userId, likeCount, likedByMe, createdAt: row.created_at, updatedAt: row.updated_at, replies: [] };
}

function displayName(email?: string) {
  return email?.split("@")[0] || "HerPitches 用户";
}
