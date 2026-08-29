export type CommunityKind = "official" | "team" | "player";

export type CommunityMeta = {
  id: string;
  kind: CommunityKind;
  zhName: string;
  enName: string;
  avatarUrl?: string;
  badgeUrl?: string;
};

export type CommunityPost = {
  id: string;
  communityId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export type CommunityState = {
  activeCommunityId: string;
  communities: CommunityMeta[];
  posts: CommunityPost[];
};

export const COMMUNITY_STORAGE_KEY = "herpitches.community.demo.v1";
export const HERPITCHES_COMMUNITY: CommunityMeta = {
  id: "herpitches",
  kind: "official",
  zhName: "herpitches 社区",
  enName: "HerPitches Community",
};

export function createInitialCommunityState(): CommunityState {
  return {
    activeCommunityId: HERPITCHES_COMMUNITY.id,
    communities: [HERPITCHES_COMMUNITY],
    posts: [
      {
        id: "post-herpitches-1",
        communityId: HERPITCHES_COMMUNITY.id,
        authorName: "HerPitches 编辑",
        content: "欢迎来到 herpitches 社区，关注球队和球员后这里会自动多出你自己的圈子。",
        createdAt: "2026-08-28T02:00:00.000Z",
      },
      {
        id: "post-herpitches-2",
        communityId: HERPITCHES_COMMUNITY.id,
        authorName: "社区成员",
        content: "右滑可以打开已关注社区侧栏，底部加号可以直接发帖。",
        createdAt: "2026-08-28T01:20:00.000Z",
      },
    ],
  };
}

export function readCommunityState(): CommunityState {
  if (typeof window === "undefined") return createInitialCommunityState();
  try {
    const raw = window.localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) return createInitialCommunityState();
    const parsed = JSON.parse(raw) as Partial<CommunityState>;
    const communities = normalizeCommunities(parsed.communities);
    const posts = normalizePosts(parsed.posts);
    const activeCommunityId = communities.some((item) => item.id === parsed.activeCommunityId) ? String(parsed.activeCommunityId) : HERPITCHES_COMMUNITY.id;
    return {
      activeCommunityId,
      communities,
      posts: posts.length ? posts : createInitialCommunityState().posts,
    };
  } catch {
    return createInitialCommunityState();
  }
}

export function writeCommunityState(state: CommunityState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(state));
}

export function upsertCommunity(state: CommunityState, community: CommunityMeta) {
  const communities = state.communities.some((item) => item.id === community.id)
    ? state.communities.map((item) => (item.id === community.id ? { ...item, ...community } : item))
    : [...state.communities, community];
  return { ...state, communities };
}

export function addCommunityPost(state: CommunityState, post: CommunityPost) {
  return { ...state, posts: [post, ...state.posts] };
}

export function createCommunityFromFollow(input: { targetType: "team" | "player"; targetId: string; targetName: string; targetAvatarUrl?: string }): CommunityMeta {
  const englishName = input.targetType === "team" ? input.targetName : input.targetName;
  return {
    id: `${input.targetType}-${input.targetId}`,
    kind: input.targetType,
    zhName: input.targetName,
    enName: englishName,
    avatarUrl: input.targetType === "player" ? input.targetAvatarUrl : undefined,
    badgeUrl: input.targetType === "team" ? input.targetAvatarUrl : undefined,
  };
}

function normalizeCommunities(communities: unknown): CommunityMeta[] {
  const items = Array.isArray(communities) ? communities : [];
  const mapped = items
    .filter((item): item is CommunityMeta => Boolean(item && typeof item === "object" && typeof (item as CommunityMeta).id === "string"))
    .map((item) => ({ ...item }));
  return mapped.some((item) => item.id === HERPITCHES_COMMUNITY.id) ? mapped : [HERPITCHES_COMMUNITY, ...mapped];
}

function normalizePosts(posts: unknown): CommunityPost[] {
  const items = Array.isArray(posts) ? posts : [];
  return items.filter((item): item is CommunityPost => Boolean(item && typeof item === "object" && typeof (item as CommunityPost).id === "string" && typeof (item as CommunityPost).communityId === "string"));
}
