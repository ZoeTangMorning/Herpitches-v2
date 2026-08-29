import Link from "next/link";
import { redirect } from "next/navigation";
import { FollowList } from "@/components/user/follow-list";
import { getAuthContext, getMyFollows } from "@/lib/supabase/queries";

export const metadata = { title: "我的关注" };
export const dynamic = "force-dynamic";

// 关注页只加载当前用户的记录，具体分组和删除操作交给客户端组件。
export default async function FollowsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/auth/login?next=/me/follows");
  const result = await getMyFollows(context);
  return (
    <section className="space-y-5 py-4">
        <Link href="/me" className="text-sm font-bold text-brand">← 返回我的</Link>
        <header><h1 className="mt-4 text-3xl font-black text-ink">我的关注</h1><p className="mt-3 text-sm leading-6 text-muted">管理关注的球队、球员和赛事。</p></header>
        {result.error ? <ErrorState /> : <FollowList records={result.data} />}
    </section>
  );
}

function ErrorState() {
  return <p className="rounded-2xl bg-surface p-5 text-sm leading-6 text-red-700">关注数据暂时无法读取，请确认 Supabase 数据库迁移已执行。</p>;
}
