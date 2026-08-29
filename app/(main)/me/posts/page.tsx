import Link from "next/link";
import { redirect } from "next/navigation";
import { MyPostList } from "@/components/community/my-post-list";
import { getMyCommunityPosts } from "@/lib/supabase/post-queries";
import { getAuthContext } from "@/lib/supabase/queries";

export const metadata = { title: "我的帖子" };
export const dynamic = "force-dynamic";

export default async function MyPostsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/auth/login?next=/me/posts");
  const result = await getMyCommunityPosts(context);
  return (
    <section className="space-y-5 py-4">
      <Link href="/me" className="text-sm font-bold text-brand">← 返回我的</Link>
      <header>
        <h1 className="mt-4 text-3xl font-black text-ink">我的帖子</h1>
        <p className="mt-3 text-sm leading-6 text-muted">这里显示你在社区发过的帖子和收到的点赞。</p>
      </header>
      {result.error ? (
        <p className="rounded-2xl bg-surface p-5 text-sm leading-6 text-red-700">帖子记录暂时无法读取，请稍后重试。</p>
      ) : (
        <MyPostList posts={result.data} />
      )}
    </section>
  );
}
