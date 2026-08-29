import type { AuthContext } from "@/lib/supabase/queries";
import type { CommunityContext } from "@/lib/supabase/community-context";
import type { LikeState, LikeTargetType, ReportInput, ReportRecord } from "@/types/community";

type Row = Record<string, any>;
type LikeInput = { targetType: LikeTargetType; targetId: string };

// 点赞状态可以公开读取，likedByMe 只有当前用户已登录时才会是 true。
export async function getLikeState(context: CommunityContext, input: LikeInput) {
  const { data, error } = await context.client.from("likes").select("target_id,user_id").eq("target_type", input.targetType).eq("target_id", input.targetId);
  if (error) return { data: emptyLike(input), error: error.message };
  return { data: mapLikeState(input, data ?? [], context.user?.id) };
}

export async function addLike(context: AuthContext, input: LikeInput) {
  const existing = await context.client.from("likes").select("id").eq("user_id", context.user.id).eq("target_type", input.targetType).eq("target_id", input.targetId).maybeSingle();
  if (existing.error) return { data: emptyLike(input), error: existing.error.message };
  if (!existing.data) {
    const { error } = await context.client.from("likes").insert({ user_id: context.user.id, target_type: input.targetType, target_id: input.targetId });
    if (error) return { data: emptyLike(input), error: error.message };
  }
  return getLikeState({ client: context.client, user: context.user }, input);
}

export async function removeLike(context: AuthContext, input: LikeInput) {
  const { error } = await context.client.from("likes").delete().eq("user_id", context.user.id).eq("target_type", input.targetType).eq("target_id", input.targetId);
  if (error) return { data: emptyLike(input), error: error.message };
  return getLikeState({ client: context.client, user: context.user }, input);
}

export async function addReport(context: AuthContext, input: ReportInput) {
  const existing = await context.client.from("reports").select("*").eq("user_id", context.user.id).eq("comment_id", input.commentId).maybeSingle();
  if (existing.error) return { data: null, error: existing.error.message };
  if (existing.data) return { data: mapReport(existing.data), duplicate: true };
  const { data, error } = await context.client.from("reports").insert({
    user_id: context.user.id,
    comment_id: input.commentId,
    reason: input.reason,
    detail: input.detail ?? null,
  }).select().single();
  if (error) return { data: null, error: error.message };
  return { data: mapReport(data), duplicate: false };
}

function mapLikeState(input: LikeInput, rows: Row[], userId?: string): LikeState {
  return { targetType: input.targetType, targetId: input.targetId, likeCount: rows.length, likedByMe: rows.some((row) => row.user_id === userId) };
}

function emptyLike(input: LikeInput): LikeState {
  return { targetType: input.targetType, targetId: input.targetId, likeCount: 0, likedByMe: false };
}

function mapReport(row: Row): ReportRecord {
  return { id: row.id, commentId: row.comment_id, reason: row.reason, detail: row.detail ?? undefined, createdAt: row.created_at };
}
