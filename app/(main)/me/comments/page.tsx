import Link from "next/link";
import { redirect } from "next/navigation";
import { MyCommentList } from "@/components/community/my-comment-list";
import { getMyComments } from "@/lib/supabase/comment-queries";
import { getAuthContext } from "@/lib/supabase/queries";

export const metadata = { title: "我的评论" };
export const dynamic = "force-dynamic";

// 个人评论页只展示当前用户自己的记录和审核状态。
export default async function MyCommentsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/auth/login?next=/me/comments");
  const result = await getMyComments(context);
  return (
    <section className="space-y-5 py-4">
      <Link href="/me" className="text-sm font-bold text-brand">← 返回我的</Link>
      <header>
        <h1 className="mt-4 text-3xl font-black text-ink">我的评论</h1>
        <p className="mt-3 text-sm leading-6 text-muted">这里显示你的评论和审核状态。</p>
      </header>
      {result.error ? (
        <p className="rounded-2xl bg-surface p-5 text-sm leading-6 text-red-700">评论记录暂时无法读取，请稍后重试。</p>
      ) : (
        <MyCommentList comments={result.data} />
      )}
    </section>
  );
}
