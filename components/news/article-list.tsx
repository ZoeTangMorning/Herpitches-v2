import { ArticleCard } from "@/components/news/article-card";
import type { Article } from "@/types/article";

type ArticleListProps = {
  articles: Article[];
};

export function ArticleList({ articles }: ArticleListProps) {
  if (!articles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
        <h2 className="text-base font-black text-ink">暂无匹配新闻</h2>
        <p className="mt-2 text-sm leading-6 text-muted">换一个关键词或分类试试，假新闻样例会继续保留在列表中。</p>
      </div>
    );
  }
  return <div className="divide-y divide-line rounded-2xl border border-line bg-white">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>;
}
