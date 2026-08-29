import { NextRequest, NextResponse } from "next/server";
import { getMockArticleById, getMockArticles } from "@/lib/news/articles";
import type { ArticleType } from "@/types/article";

// 第四组先返回假新闻，后续接 Supabase 时保持同样的对外字段。
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const articleId = params.get("articleId");
  if (articleId) {
    const article = getMockArticleById(articleId);
    return NextResponse.json({ data: article ?? null, source: "mock", updatedAt: new Date().toISOString(), isStale: true });
  }
  const data = getMockArticles({
    keyword: params.get("keyword") ?? undefined,
    type: toArticleType(params.get("type") ?? undefined),
    teamId: params.get("teamId") ?? undefined,
  });
  return NextResponse.json({ data, source: "mock", updatedAt: new Date().toISOString(), isStale: true });
}

function toArticleType(value?: string): ArticleType | "all" {
  return value === "news" || value === "feature" || value === "profile" || value === "tactics" ? value : "all";
}
