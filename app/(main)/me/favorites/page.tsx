import Link from "next/link";
import { redirect } from "next/navigation";
import { FavoriteList } from "@/components/user/favorite-list";
import { getAuthContext, getMyFavorites } from "@/lib/supabase/queries";

export const metadata = { title: "我的收藏" };
export const dynamic = "force-dynamic";

// 收藏页只展示当前用户保存的新闻，不把其他用户的收藏混进来。
export default async function FavoritesPage() {
  const context = await getAuthContext();
  if (!context) redirect("/auth/login?next=/me/favorites");
  const result = await getMyFavorites(context);
  return (
    <section className="space-y-5 py-4">
        <Link href="/me" className="text-sm font-bold text-brand">← 返回我的</Link>
        <header><h1 className="mt-4 text-3xl font-black text-ink">我的收藏</h1><p className="mt-3 text-sm leading-6 text-muted">跨设备保存的新闻会显示在这里。</p></header>
        {result.error ? <p className="rounded-2xl bg-surface p-5 text-sm leading-6 text-red-700">收藏数据暂时无法读取，请确认 Supabase 数据库迁移已执行。</p> : <FavoriteList records={result.data} />}
    </section>
  );
}
