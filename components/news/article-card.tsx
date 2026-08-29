import Link from "next/link";
import { ArticleActions } from "@/components/news/article-actions";
import type { Article } from "@/types/article";

type ArticleCardProps = {
  article: Article;
  commentsHref?: string;
};

// 列表项是竖向流式排列：标题在左，图片在右。
export function ArticleCard({ article, commentsHref = "#comments" }: ArticleCardProps) {
  return (
    <article className="border-b border-line py-4 last:border-b-0">
      <Link href={`/news/${article.id}`} className="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-brand">{typeLabel(article.type)}</p>
          <h2 className="mt-1 break-words text-[18px] font-black leading-7 text-ink">{article.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{article.summary}</p>
        </div>
        <div className="h-[84px] overflow-hidden rounded-xl bg-surface">
          {article.coverUrl ? <img src={article.coverUrl} alt={article.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-bold text-muted">暂无图片</div>}
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
