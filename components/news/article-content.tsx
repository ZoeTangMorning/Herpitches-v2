import type { Article } from "@/types/article";
import { ArticleActions } from "@/components/news/article-actions";
import { ArticleRelations } from "@/components/news/article-relations";

type ArticleContentProps = {
  article: Article;
};

// 详情页正文先直接用文本展示，保留未来替换成 Markdown 的位置。
export function ArticleContent({ article }: ArticleContentProps) {
  return (
    <article className="space-y-5">
      <div>
        <p className="text-xs font-bold text-brand">{typeLabel(article.type)} · {article.authorName ?? "HerPitches"}</p>
        <h1 className="mt-2 text-3xl font-black leading-10 text-ink">{article.title}</h1>
        <p className="mt-3 text-sm text-muted">{article.summary}</p>
      </div>
      {article.coverUrl ? <img src={article.coverUrl} alt={article.title} className="aspect-video w-full rounded-2xl object-cover" /> : null}
      <ArticleActions article={article} />
      <div className="space-y-4 rounded-2xl bg-white p-4 text-[16px] leading-7 text-ink">
        {article.content.split("\n").map((paragraph) => <p key={paragraph.slice(0, 16)}>{paragraph}</p>)}
      </div>
      <ArticleRelations relations={article.relations} />
    </article>
  );
}

function typeLabel(type: Article["type"]) {
  return { news: "新闻", feature: "专题", profile: "人物", tactics: "战术" }[type];
}
