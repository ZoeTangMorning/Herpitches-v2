import { notFound } from "next/navigation";
import { DataSourceNote, EmptyState } from "@/components/data/data-state";
import { FixtureCard } from "@/components/data/fixture-card";
import { TeamBadge } from "@/components/data/team-badge";
import { PlayerCard } from "@/components/data/player-card";
import { ArticleCard } from "@/components/news/article-card";
import { getMockArticles } from "@/lib/news/articles";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import { DEFAULT_SEASON } from "@/lib/wsl-api/constants";
import { formatNullableText } from "@/lib/formatters/player";
import { FollowButton } from "@/components/user/follow-button";

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
};

export const metadata = { title: "球队详情" };

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const adapter = getWslApiAdapter();
  const [team, fixtures] = await Promise.all([
    adapter.getTeam(teamId),
    adapter.getFixtures({ season: DEFAULT_SEASON, teamId }),
  ]);
  if (team.data.id !== teamId) notFound();
  const relatedArticles = getMockArticles({ teamId });

  return (
    <div className="space-y-8">
      <header>
        <div className="mt-5 flex items-start gap-4">
          <TeamBadge label={team.data.name} src={team.data.badgeUrl ? team.data.badgeUrl : `/images/team-badges/${team.data.id}.png`} className="h-16 w-16" />
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-black text-ink sm:text-3xl">{team.data.name}</h1>
            <p className="mt-1 text-sm text-muted">{team.data.leagueName}</p>
            <div className="mt-3">
              <FollowButton targetType="team" targetId={team.data.id} targetName={team.data.name} targetAvatarUrl={team.data.badgeUrl ?? `/images/team-badges/${team.data.id}.png`} />
            </div>
          </div>
        </div>
      </header>
      <DataSourceNote result={team} />
      {team.error ? <ErrorPanel message={team.error} /> : null}
      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
        <h2 className="text-lg font-black text-ink">球队资料</h2>
        <p className="mt-4 text-sm leading-7 text-muted">{formatNullableText(team.data.description)}</p>
        <p className="mt-3 text-sm text-muted">主场：{formatNullableText(team.data.stadium)} · 成立：{formatNullableText(team.data.formedYear)}</p>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-black text-ink">球员名单</h2>
        {team.data.players.length ? <div className="grid gap-4">{team.data.players.map((player) => <PlayerCard key={player.id} player={player} />)}</div> : <EmptyState title="暂无球员名单" description="该球队目前没有可展示的球员资料。" />}
      </section>
      <section>
        <h2 className="mb-4 text-lg font-black text-ink">近期赛程</h2>
        {fixtures.data.length ? <div className="grid gap-4">{fixtures.data.slice(0, 6).map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />)}</div> : <EmptyState title="暂无赛程" description="该球队目前没有可展示的比赛。" />}
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-ink">主队相关新闻</h2>
          <p className="text-xs font-bold text-muted">{relatedArticles.length} 篇</p>
        </div>
        <div className="space-y-3">
          {relatedArticles.length ? relatedArticles.map((article) => <ArticleCard key={article.id} article={article} commentsHref={`/news/${article.id}#comments`} />) : <EmptyState title="暂无相关新闻" description="当前没有可展示的主队新闻。" />}
        </div>
      </section>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{message}</p>;
}
