import type { AuthContext } from "@/lib/supabase/queries";
import type { CommunityContext } from "@/lib/supabase/community-context";
import type { CommunityKind, CommunityPostRecord, PostInput } from "@/types/community";

type Row = Record<string, any>;
type QueryResult<T> = { data: T; error?: string; status?: number };

// 社区公开流只展示 approved 帖子；当前用户的 likedByMe 通过登录 Cookie 判断。
export async function getCommunityPosts(context: CommunityContext, communityId: string, limit = 30): Promise<QueryResult<CommunityPostRecord[]>> {
  const { data, error } = await context.client
    .from("community_posts")
    .select("*")
    .eq("community_id", communityId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { data: [], error: error.message };
  return { data: await attachLikes(context, data ?? []) };
}

export async function getMyCommunityPosts(context: AuthContext): Promise<QueryResult<CommunityPostRecord[]>> {
  const publicContext = { client: context.client, user: context.user };
  const { data, error } = await context.client
    .from("community_posts")
    .select("*")
    .eq("user_id", context.user.id)
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  const names = await getCommunityNames(context);
  return { data: await attachLikes(publicContext, data ?? [], names) };
}

export async function addCommunityPost(context: AuthContext, input: PostInput): Promise<QueryResult<CommunityPostRecord | null>> {
  const community = await resolveAllowedCommunity(context, input.communityId);
  if ("error" in community) return { data: null, error: community.error, status: community.status };
  const { data, error } = await context.client
    .from("community_posts")
    .insert({
      user_id: context.user.id,
      community_id: input.communityId,
      community_kind: community.kind,
      author_name: displayName(context.user.email),
      content: input.content,
      status: "approved",
    })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapPost(data, context.user.id, 0, false, community.name) };
}

async function resolveAllowedCommunity(context: AuthContext, communityId: string): Promise<{ kind: CommunityKind; name?: string } | { error: string; status: number }> {
  if (communityId === "herpitches") return { kind: "official", name: "herpitches 社区" };
  const teamId = communityId.startsWith("team-") ? communityId.slice("team-".length) : "";
  const playerId = communityId.startsWith("player-") ? communityId.slice("player-".length) : "";
  const kind = teamId ? "team" : playerId ? "player" : undefined;
  const targetId = teamId || playerId;
  if (!kind || !targetId) return { error: "社区 ID 不正确。", status: 400 };
  const { data, error } = await context.client
    .from("follows")
    .select("target_name")
    .eq("user_id", context.user.id)
    .eq("target_type", kind)
    .eq("target_id", targetId)
    .maybeSingle();
  if (error) return { error: error.message, status: 503 };
  if (!data) return { error: "只能在已关注社区发帖。", status: 403 };
  return { kind, name: data.target_name ?? undefined };
}

async function getCommunityNames(context: AuthContext) {
  const names = new Map<string, string>([["herpitches", "herpitches 社区"]]);
  const { data } = await context.client.from("follows").select("target_type,target_id,target_name").eq("user_id", context.user.id);
  (data ?? []).forEach((row: Row) => {
    if (row.target_type === "team" || row.target_type === "player") {
      names.set(`${row.target_type}-${row.target_id}`, row.target_name);
    }
  });
  return names;
}

async function attachLikes(context: CommunityContext, rows: Row[], names?: Map<string, string>) {
  const ids = rows.map((row) => String(row.id));
  const { data } = ids.length
    ? await context.client.from("likes").select("target_id,user_id").eq("target_type", "post").in("target_id", ids)
    : { data: [] };
  const countMap = new Map<string, number>();
  const likedSet = new Set<string>();
  (data ?? []).forEach((like: Row) => {
    const targetId = String(like.target_id);
    countMap.set(targetId, (countMap.get(targetId) ?? 0) + 1);
    if (context.user?.id === like.user_id) likedSet.add(targetId);
  });
  return rows.map((row) => mapPost(row, context.user?.id, countMap.get(row.id) ?? 0, likedSet.has(row.id), names?.get(row.community_id)));
}

function mapPost(row: Row, userId: string | undefined, likeCount: number, likedByMe: boolean, communityName?: string): CommunityPostRecord {
  return {
    id: row.id,
    communityId: row.community_id,
    communityKind: row.community_kind,
    communityName,
    authorName: row.author_name,
    content: row.content,
    status: row.status,
    isOwn: row.user_id === userId,
    likeCount,
    likedByMe,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function displayName(email?: string) {
  return email?.split("@")[0] || "HerPitches 用户";
}
