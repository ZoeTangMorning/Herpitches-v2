import Link from "next/link";
import { ArticleActions } from "@/components/news/article-actions";
import { FallbackImage } from "@/components/ui/fallback-image";
import type { Article } from "@/types/article";

type ArticleCardProps = {
  article: Article;
  commentsHref?: string;
};

// 列表项是竖向流式排列：标题在左，图片在右。
export function ArticleCard({ article, commentsHref = "#comments" }: ArticleCardProps) {
  return (
    <article className="border-b border-line py-4 last:border-b-0">
      <Link href={`/news/${article.id}`} className="grid grid-cols-[minmax(0,1fr)_96px] gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
        <div className="min-w-0">
          <p className="text-xs font-bold text-brand">{typeLabel(article.type)}</p>
          <h2 className="mt-1 break-words text-[16px] font-black leading-6 text-ink sm:text-[18px] sm:leading-7">{article.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{article.summary}</p>
        </div>
        <div className="h-[84px] overflow-hidden rounded-xl bg-surface">
          <FallbackImage src={article.coverUrl} alt={article.title} fallbackText="暂无图片" compactFallback={false} className="h-full w-full rounded-none text-xs font-bold !text-muted" />
        </div>
      </Link>
      <div className="mt-3">
        <ArticleActions article={article} commentsHref={commentsHref} />
      </div>
    </article>
  );
}

function typeLabel(type: Article["type"]) {
  return { news: "新闻", feature: "专题", profile: "人物", tactics: "战术" }[type];
}
