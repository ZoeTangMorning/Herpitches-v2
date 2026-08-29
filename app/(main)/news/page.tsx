import { ArticleFilters } from "@/components/news/article-filters";
import { ArticleList } from "@/components/news/article-list";
import { getMockArticles } from "@/lib/news/articles";
import type { ArticleType } from "@/types/article";

type NewsPageProps = {
  searchParams: Promise<{ keyword?: string; type?: string }>;
};

export const metadata = { title: "新闻" };

// 新闻首页先使用假新闻做移动端展示，重点把排版和图片节奏做好。
export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const type = toArticleType(params.type);
  const articles = getMockArticles({ keyword: params.keyword, type });
  return (
    <section className="space-y-4 py-4">
      <div>
        <h1 className="text-3xl font-black text-ink">新闻首页</h1>
        <p className="mt-3 text-sm leading-6 text-muted">新闻、转会、人物访谈、战术</p>
      </div>
      <ArticleFilters keyword={params.keyword} type={type} />
      <ArticleList articles={articles} />
    </section>
  );
}

function toArticleType(value?: string): ArticleType | "all" {
  return value === "news" || value === "feature" || value === "profile" || value === "tactics" ? value : "all";
}
