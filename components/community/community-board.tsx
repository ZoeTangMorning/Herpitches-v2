"use client";

import { Menu, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { HERPITCHES_COMMUNITY } from "@/components/community/community-storage";
import { TeamBadge } from "@/components/data/team-badge";
import { LikeButton } from "@/components/community/like-button";
import { formatDateTime } from "@/lib/formatters/date";
import { FallbackImage } from "@/components/ui/fallback-image";
import type { CommunityMeta, CommunityPostRecord } from "@/types/community";

const MIN_POST_LENGTH = 2;
const MAX_POST_LENGTH = 500;
const REQUEST_TIMEOUT_MS = 12000;

type CommunityBoardProps = {
  initialCommunities?: CommunityMeta[];
  initialPosts?: CommunityPostRecord[];
  isLoggedIn?: boolean;
};

export function CommunityBoard({
  initialCommunities = [HERPITCHES_COMMUNITY],
  initialPosts = [],
  isLoggedIn = false,
}: CommunityBoardProps) {
  const communities = useMemo(() => ensureHerpitches(initialCommunities), [initialCommunities]);
  const [activeCommunityId, setActiveCommunityId] = useState(HERPITCHES_COMMUNITY.id);
  const [postsByCommunity, setPostsByCommunity] = useState<Record<string, CommunityPostRecord[]>>(() => ({
    [HERPITCHES_COMMUNITY.id]: initialPosts,
  }));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [composerError, setComposerError] = useState("");
  const [posting, setPosting] = useState(false);
  const touchStartX = useRef<number | null>(null);

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

  const activeCommunity = useMemo(() => communities.find((item) => item.id === activeCommunityId) ?? HERPITCHES_COMMUNITY, [activeCommunityId, communities]);
  const activePosts = postsByCommunity[activeCommunity.id] ?? [];

  function selectCommunity(id: string) {
    setActiveCommunityId(id);
    setDrawerOpen(false);
    if (!postsByCommunity[id]) void loadPosts(id);
  }

  function openComposer() {
    if (!isLoggedIn) {
      window.location.href = `/auth/login?next=${encodeURIComponent("/community")}`;
      return;
    }
    setComposerError("");
    setComposerOpen(true);
  }

  async function loadPosts(communityId: string) {
    setLoading(true);
    setFeedError("");
    try {
      const response = await fetchWithTimeout(`/api/community/posts?communityId=${encodeURIComponent(communityId)}`);
      if (!response.ok) {
        setFeedError("帖子暂时无法读取，请稍后重试。");
        return;
      }
      const payload = await response.json();
      setPostsByCommunity((current) => ({ ...current, [communityId]: payload.data ?? [] }));
    } catch (error) {
      setFeedError(isAbortError(error) ? "帖子读取超时，请稍后重试。" : "帖子暂时无法读取，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function submitPost() {
    const content = draft.trim();
    if (!content) return;
    if (content.length < MIN_POST_LENGTH) {
      setComposerError("帖子至少需要 2 个字。");
      return;
    }
    if (content.length > MAX_POST_LENGTH) {
      setComposerError("帖子不能超过 500 个字。");
      return;
    }
    setPosting(true);
    setComposerError("");
    try {
      const response = await fetchWithTimeout("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: activeCommunity.id, content }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/auth/login?next=${encodeURIComponent("/community")}`;
        return;
      }
      if (!response.ok || !payload.data) {
        setComposerError(payload.message ?? "发布失败，请稍后重试。");
        return;
      }
      const post = payload.data as CommunityPostRecord;
      setPostsByCommunity((current) => ({ ...current, [activeCommunity.id]: [post, ...(current[activeCommunity.id] ?? [])] }));
      setDraft("");
      setComposerOpen(false);
    } catch (error) {
      setComposerError(isAbortError(error) ? "发布超时，请稍后重试。" : "网络连接失败，请稍后重试。");
    } finally {
      setPosting(false);
    }
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
              {communities.map((community) => (
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
          <h1 className="text-3xl font-black leading-tight text-ink sm:text-4xl">社区</h1>
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
            {loading ? (
              <p className="rounded-2xl bg-surface p-6 text-center text-sm leading-6 text-muted">帖子加载中...</p>
            ) : feedError ? (
              <p className="rounded-2xl bg-surface p-6 text-center text-sm leading-6 text-red-700">{feedError}</p>
            ) : activePosts.length ? (
              activePosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <EmptyState />
            )}
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={openComposer}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-20 inline-flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#8a4ca5] text-white shadow-[0_16px_32px_rgba(138,76,165,0.35)] transition-transform hover:scale-105 md:bottom-20"
      >
        <span className="sr-only">发布帖子</span>
        <Plus size={26} strokeWidth={2.2} />
      </button>

      {composerOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-4 md:items-center">
          <div className="w-full max-w-[480px] rounded-3xl bg-white p-4 shadow-panel">
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
              maxLength={MAX_POST_LENGTH}
              className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-6 text-ink outline-none"
            />
            <div className="mt-4 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setComposerOpen(false)} className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-muted">
                取消
              </button>
              <button type="button" onClick={submitPost} className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={posting || !draft.trim()}>
                {posting ? "发布中..." : "发布"}
              </button>
            </div>
            {composerError ? <p role="alert" className="mt-3 text-sm text-red-700">{composerError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ensureHerpitches(communities: CommunityMeta[]) {
  const items = communities.length ? communities : [HERPITCHES_COMMUNITY];
  return items.some((item) => item.id === HERPITCHES_COMMUNITY.id) ? items : [HERPITCHES_COMMUNITY, ...items];
}

function CommunityAvatar({ community, sizeClassName }: { community: CommunityMeta; sizeClassName: string }) {
  if (community.kind === "team") return <TeamBadge label={community.zhName} src={community.badgeUrl ?? `/images/team-badges/${community.id.replace(/^team-/, "")}.png`} className={sizeClassName} />;
  return <FallbackImage src={community.avatarUrl} alt={community.zhName} fallbackText={community.zhName} className={`${sizeClassName} rounded-md text-sm font-black text-brand`} />;
}

function PostCard({ post }: { post: CommunityPostRecord }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-ink">{post.authorName}</p>
        <p className="text-xs text-muted">{formatDateTime(post.createdAt)}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink">{post.content}</p>
      <div className="mt-3 flex justify-end">
        <LikeButton targetType="post" targetId={post.id} initialCount={post.likeCount} initiallyLiked={post.likedByMe} compact />
      </div>
    </article>
  );
}

function EmptyState() {
  return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm leading-6 text-muted">这里还没有帖子。</p>;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
