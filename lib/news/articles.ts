import type { Article, ArticleQuery } from "@/types/article";
import { mockArticles } from "@/lib/news/mock-articles";

// 新闻查询先只服务于展示层，后续再替换为 Supabase 真数据。
export function getMockArticles(query?: ArticleQuery) {
  return filterArticles(mockArticles, query);
}

export function getMockArticleById(articleId: string) {
  return mockArticles.find((item) => item.id === articleId);
}

function filterArticles(items: Article[], query?: ArticleQuery) {
  return items.filter((item) => {
    const matchesType = !query?.type || query.type === "all" || item.type === query.type;
    const matchesTeam = !query?.teamId || item.relations.some((relation) => relation.teamId === query.teamId);
    const keyword = query?.keyword?.trim().toLowerCase();
    const matchesKeyword =
      !keyword ||
      [item.title, item.summary, item.content, item.authorName ?? "", ...item.relations.map((relation) => relation.teamName ?? ""), ...item.relations.map((relation) => relation.playerName ?? "")]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    return matchesType && matchesTeam && matchesKeyword;
  });
}
