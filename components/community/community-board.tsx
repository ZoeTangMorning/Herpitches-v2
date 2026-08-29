"use client";

import { Menu, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addCommunityPost,
  createCommunityFromFollow,
  createInitialCommunityState,
  HERPITCHES_COMMUNITY,
  readCommunityState,
  type CommunityMeta,
  type CommunityPost,
  type CommunityState,
  upsertCommunity,
  writeCommunityState,
} from "@/components/community/community-storage";
import { TeamBadge } from "@/components/data/team-badge";

type CommunityBoardProps = {
  initialCommunities?: CommunityMeta[];
  initialPosts?: CommunityPost[];
  isLoggedIn?: boolean;
};

export function CommunityBoard({
  initialCommunities = [HERPITCHES_COMMUNITY],
  initialPosts = createInitialCommunityState().posts,
  isLoggedIn = false,
}: CommunityBoardProps) {
  const [state, setState] = useState<CommunityState>(() => createSeedState(initialCommunities, initialPosts));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const stored = readCommunityState();
    setState((current) => mergeState(current, stored, initialCommunities));
    setHydrated(true);
  }, [initialCommunities]);

  useEffect(() => {
    if (!hydrated) return;
    writeCommunityState(state);
  }, [hydrated, state]);

  useEffect(() => {
    function handleFollow(event: Event) {
      const detail = (event as CustomEvent<{ targetType?: string; targetId?: string; targetName?: string; targetAvatarUrl?: string }>).detail;
      if (!detail?.targetType || detail.targetType === "match" || !detail.targetId || !detail.targetName) return;
      const community = createCommunityFromFollow({
        targetType: detail.targetType as "team" | "player",
        targetId: detail.targetId,
        targetName: detail.targetName,
        targetAvatarUrl: detail.targetAvatarUrl,
      });
      setState((current) => upsertCommunity(current, community));
    }

    window.addEventListener("herpitches-follow", handleFollow);
    return () => window.removeEventListener("herpitches-follow", handleFollow);
  }, []);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setComposerOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  const activeCommunity = useMemo(() => state.communities.find((item) => item.id === state.activeCommunityId) ?? HERPITCHES_COMMUNITY, [state.activeCommunityId, state.communities]);
  const activePosts = useMemo(() => state.posts.filter((post) => post.communityId === activeCommunity.id), [activeCommunity.id, state.posts]);

  function selectCommunity(id: string) {
    setState((current) => ({ ...current, activeCommunityId: id }));
    setDrawerOpen(false);
  }

  function submitPost() {
    const content = draft.trim();
    if (!content) return;
    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      communityId: activeCommunity.id,
      authorName: "我",
      content,
      createdAt: new Date().toISOString(),
    };
    setState((current) => addCommunityPost(current, post));
    setDraft("");
    setComposerOpen(false);
  }

  function handleTouchStart(event: React.TouchEvent) {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select")) {
      touchStartX.current = null;
      return;
    }
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (startX == null || endX == null) return;
    const delta = endX - startX;
    if (delta > 60) setDrawerOpen(true);
    if (delta < -60) setDrawerOpen(false);
  }

  return (
    <div className="relative min-w-0" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <aside
        className={`fixed left-0 top-0 z-30 h-[100dvh] w-[min(84vw,320px)] max-w-[calc(100vw-1rem)] overflow-hidden border-r border-line bg-white shadow-[12px_0_30px_rgba(36,27,38,0.16)] transition-transform duration-300 md:w-[300px] ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 pb-4 pl-4 pr-4 pt-[calc(1rem+env(safe-area-inset-top))] md:pt-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">已关注社区</p>
              <p className="mt-1 text-sm text-muted">{isLoggedIn ? "herpitches" : "演示访问"}</p>
            </div>
            <button type="button" onClick={() => setDrawerOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-brand">
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            <div className="space-y-2">
              {state.communities.map((community) => (
                <button
                  key={community.id}
                  type="button"
                  onClick={() => selectCommunity(community.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${
                    community.id === activeCommunity.id ? "border-brand bg-[#f3eaf7]" : "border-line bg-white"
                  }`}
                >
                  <CommunityAvatar community={community} sizeClassName="h-11 w-11" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-ink">{community.zhName}</span>
                    <span className="mt-1 block truncate text-xs text-muted">{community.enName}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {drawerOpen ? <button type="button" aria-label="关闭侧栏" onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-20 bg-black/20 md:hidden" /> : null}

      <div className="space-y-5 pb-32">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-4xl font-black leading-tight text-ink">社区</h1>
          <button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-brand shadow-panel">
            <span className="sr-only">打开已关注社区</span>
            <Menu size={22} />
          </button>
        </div>

        <section className="max-h-[32vh] overflow-y-auto">
          <div className="flex flex-col items-center gap-3 px-5 py-2 text-center">
            <CommunityAvatar community={activeCommunity} sizeClassName="h-20 w-20" />
            <div className="space-y-1">
              <p className="text-base font-black text-ink">{activeCommunity.zhName}</p>
              <p className="text-sm text-muted">{activeCommunity.enName}</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-ink">用户帖子</h2>
            <p className="text-xs font-bold text-muted">{activePosts.length} 条</p>
          </div>
          <div className="space-y-3">
            {activePosts.length ? activePosts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState />}
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setComposerOpen(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-20 inline-flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#8a4ca5] text-white shadow-[0_16px_32px_rgba(138,76,165,0.35)] transition-transform hover:scale-105 md:bottom-20"
      >
        <span className="sr-only">发布帖子</span>
        <Plus size={26} strokeWidth={2.2} />
      </button>

      {composerOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-4 md:items-center">
          <div className="w-full max-w-[520px] rounded-3xl bg-white p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-ink">发一条帖子</h3>
              <button type="button" onClick={() => setComposerOpen(false)} className="text-muted">
                <X size={18} />
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="说点什么..."
              className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-6 text-ink outline-none"
            />
            <div className="mt-4 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setComposerOpen(false)} className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-muted">
                取消
              </button>
              <button type="button" onClick={submitPost} className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={!draft.trim()}>
                发布
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function createSeedState(communities: CommunityMeta[], posts: CommunityPost[]): CommunityState {
  const seed = createInitialCommunityState();
  const state = communities.reduce((current, community) => upsertCommunity(current, community), seed);
  return { ...state, activeCommunityId: HERPITCHES_COMMUNITY.id, posts: posts.length ? posts : seed.posts };
}

function mergeState(current: CommunityState, stored: CommunityState, requiredCommunities: CommunityMeta[]) {
  const withStored = stored.communities.reduce((next, community) => upsertCommunity(next, community), current);
  const withRequired = requiredCommunities.reduce((next, community) => upsertCommunity(next, community), withStored);
  const activeCommunityId = withRequired.communities.some((item) => item.id === stored.activeCommunityId) ? stored.activeCommunityId : HERPITCHES_COMMUNITY.id;
  return {
    ...withRequired,
    activeCommunityId,
    posts: stored.posts.length ? stored.posts : current.posts,
  };
}

function CommunityAvatar({ community, sizeClassName }: { community: CommunityMeta; sizeClassName: string }) {
  if (community.kind === "team") return <TeamBadge label={community.zhName} src={community.badgeUrl ?? `/images/team-badges/${community.id.replace(/^team-/, "")}.png`} className={sizeClassName} />;
  if (community.avatarUrl) return <img src={community.avatarUrl} alt={community.zhName} className={`rounded-md object-cover ${sizeClassName}`} />;
  const fallback = community.zhName.trim().slice(0, 2) || "H";
  return <div className={`flex items-center justify-center rounded-md bg-surface text-sm font-black text-brand ${sizeClassName}`}>{fallback}</div>;
}

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-ink">{post.authorName}</p>
        <p className="text-xs text-muted">{new Date(post.createdAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink">{post.content}</p>
    </article>
  );
}

function EmptyState() {
  return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm leading-6 text-muted">这里还没有帖子。</p>;
}
