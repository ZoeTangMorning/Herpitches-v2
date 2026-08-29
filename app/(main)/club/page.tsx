import Link from "next/link";
import { redirect } from "next/navigation";
import { DataSourceNote, EmptyState } from "@/components/data/data-state";
import { FixtureCard } from "@/components/data/fixture-card";
import { ArticleCard } from "@/components/news/article-card";
import { getMockArticles } from "@/lib/news/articles";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import { DEFAULT_SEASON } from "@/lib/wsl-api/constants";
import { getAuthContext, getMyProfile } from "@/lib/supabase/queries";

export const metadata = { title: "主队" };
export const dynamic = "force-dynamic";

// 主队页只展示当前用户选中的一支球队，不把多个候选队混在同一页。
export default async function ClubPage() {
  const context = await getAuthContext();
  if (!context) redirect("/auth/login?next=/club");
  const profile = await getMyProfile(context);
  if (profile.error) return <EmptyState title="主队暂时无法读取" description="请稍后刷新页面重试。" />;
  if (!profile.data?.mainTeamId) return <NoMainTeam />;
  const adapter = getWslApiAdapter();
  const [team, fixtures] = await Promise.all([
    adapter.getTeam(profile.data.mainTeamId),
    adapter.getFixtures({ season: DEFAULT_SEASON, teamId: profile.data.mainTeamId }),
  ]);
  const articles = getMockArticles({ teamId: profile.data.mainTeamId });
  return (
    <section className="space-y-6 py-4">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">我的主队</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{team.data.name}</h1>
          <p className="mt-2 text-sm text-muted">{team.data.leagueName}</p>
        </header>
        <DataSourceNote result={team} />
        <section className="rounded-2xl border border-line bg-white p-4 shadow-panel">
          <p className="text-sm leading-6 text-muted">这里集中显示主队的比赛和球队资料。</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-black text-ink">近期比赛</h2>
          {fixtures.data.length ? <div className="space-y-3">{fixtures.data.slice(0, 4).map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />)}</div> : <EmptyState title="暂无近期比赛" description="当前没有可展示的主队赛程。" />}
        </section>
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-ink">主队相关新闻</h2>
            <p className="text-xs font-bold text-muted">{articles.length} 篇</p>
          </div>
          <div className="divide-y divide-line rounded-2xl border border-line bg-white px-4">
            {articles.length ? articles.map((article) => <ArticleCard key={article.id} article={article} commentsHref={`/news/${article.id}#comments`} />) : <EmptyState title="暂无相关新闻" description="当前没有可展示的主队新闻。" />}
          </div>
        </section>
    </section>
  );
}

function NoMainTeam() {
  return (
    <section className="space-y-5 py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">我的主队</p>
        <h1 className="text-3xl font-black text-ink">还没有选择主队</h1>
        <p className="text-sm leading-6 text-muted">选择一支 WSL 球队，快速查看它的赛程和资讯。</p>
        <Link href="/club/select" className="inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white">选择主队</Link>
    </section>
  );
}
