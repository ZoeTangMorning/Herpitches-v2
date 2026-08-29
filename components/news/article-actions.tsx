import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { LikeButton } from "@/components/community/like-button";
import { FavoriteButton } from "@/components/user/favorite-button";
import type { Article } from "@/types/article";

type ArticleActionsProps = {
  article: Article;
  commentsHref?: string;
};

// 评论和点赞暂时保留视觉入口；收藏已经接入第五组个人数据接口。
export function ArticleActions({ article, commentsHref = "#comments" }: ArticleActionsProps) {
  const comments = article.commentsCount ?? 0;
  const reactions = article.reactionsCount ?? 0;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
      <Link href={commentsHref} className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 font-bold">
        <MessageCircle size={16} aria-hidden="true" />
        <span>评论 {comments}</span>
      </Link>
      <LikeButton targetType="article" targetId={article.id} initialCount={reactions} />
      <FavoriteButton
        articleId={article.id}
        articleTitle={article.title}
        articleCoverUrl={article.coverUrl}
        articleType={article.type}
      />
    </div>
  );
}
