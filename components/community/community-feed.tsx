import Link from "next/link";
import { LikeButton } from "@/components/community/like-button";
import { formatDateTime } from "@/lib/formatters/date";
import type { CommentRecord } from "@/types/community";

type CommunityFeedProps = {
  comments: CommentRecord[];
};

// 社区首页只展示审核通过的一级评论，点击入口回到对应新闻详情。
export function CommunityFeed({ comments }: CommunityFeedProps) {
  if (!comments.length) {
    return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm leading-6 text-muted">暂时还没有公开评论。</p>;
  }
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <article key={comment.id} className="space-y-3 rounded-2xl border border-line bg-white p-4 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0"><p className="break-words text-sm font-black text-ink">{comment.authorName}</p><p className="mt-1 text-xs text-muted">{formatDateTime(comment.createdAt)}</p></div>
            <LikeButton targetType="comment" targetId={comment.id} initialCount={comment.likeCount} initiallyLiked={comment.likedByMe} compact />
          </div>
          <p className="break-words text-sm leading-6 text-ink">{comment.content}</p>
          <Link href={`/news/${comment.articleId}#comments`} className="inline-block text-xs font-bold text-brand">查看原文和评论</Link>
        </article>
      ))}
    </div>
  );
}
