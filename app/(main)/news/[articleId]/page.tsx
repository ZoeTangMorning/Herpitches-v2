import { notFound } from "next/navigation";
import { CommentSection } from "@/components/community/comment-section";
import { ArticleContent } from "@/components/news/article-content";
import { getMockArticleById } from "@/lib/news/articles";
import { getArticleComments } from "@/lib/supabase/comment-queries";
import { getCommunityContext } from "@/lib/supabase/community-context";

type ArticlePageProps = {
  params: Promise<{ articleId: string }>;
};

export const metadata = { title: "新闻详情" };

// 详情页先直接取假新闻，保证正文、图片和关联入口都能看到。
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleId } = await params;
  const article = getMockArticleById(articleId);
  if (!article) notFound();
  const context = await getCommunityContext();
  const comments = await getArticleComments(context, articleId);
  return (
    <section className="space-y-10 py-4">
      <ArticleContent article={article} />
      <div id="comments">
        <CommentSection
          articleId={articleId}
          initialComments={comments.data}
          isLoggedIn={Boolean(context.user)}
          loadError={comments.error}
        />
      </div>
    </section>
  );
}
