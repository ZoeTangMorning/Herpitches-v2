import Link from "next/link";
import { formatDateTime } from "@/lib/formatters/date";
import type { CommunityPostRecord } from "@/types/community";

type MyPostListProps = { posts: CommunityPostRecord[] };

// 个人帖子记录只展示当前用户自己的历史发帖。
export function MyPostList({ posts }: MyPostListProps) {
  if (!posts.length) return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">还没有发帖记录。</p>;
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <article key={post.id} className="space-y-3 rounded-2xl border border-line bg-white p-4 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-brand">{post.communityName ?? post.communityId}</span>
            <span className="text-xs text-muted">{formatDateTime(post.createdAt)}</span>
          </div>
          <p className="break-words text-sm leading-6 text-ink">{post.content}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-muted">{post.likeCount} 个赞</span>
            <Link href="/community" className="text-xs font-bold text-brand">前往社区</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
