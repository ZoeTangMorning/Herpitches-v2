import Link from "next/link";
import { notFound } from "next/navigation";
import { DataSourceNote } from "@/components/data/data-state";
import { LineupPanel } from "@/components/data/lineup-panel";
import { MatchEvents } from "@/components/data/match-events";
import { TacticalAnalysis } from "@/components/data/tactical-analysis";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import { formatDateTime } from "@/lib/formatters/date";
import { formatFixtureStatus, formatScore } from "@/lib/formatters/score";
import { FollowButton } from "@/components/user/follow-button";

type MatchPageProps = {
  params: Promise<{ matchId: string }>;
};

export const metadata = { title: "比赛详情" };

// 比赛详情把基础信息、事件、阵容和战术区域按阅读顺序组合起来。
export default async function MatchPage({ params }: MatchPageProps) {
  const { matchId } = await params;
  const result = await getWslApiAdapter().getMatch(matchId);
  const match = result.data;
  // 只有比赛 ID 对得上时才展示详情，避免无效地址显示演示比赛。
  if (match.id !== matchId) notFound();
  return (
    <div className="space-y-8">
      <header>
        <div className="mt-5 rounded-md border border-line bg-white p-5 text-center shadow-panel">
          <p className="text-sm font-bold text-brand">{formatFixtureStatus(match.status)} · {formatDateTime(match.startsAt)}</p>
          <div className="mt-5 space-y-3">
            <TeamLink id={match.homeTeamId} name={match.homeTeamName} />
            <p className="rounded-md bg-surface px-3 py-2 text-2xl font-black text-ink">{formatScore(match)}</p>
            <TeamLink id={match.awayTeamId} name={match.awayTeamName} />
          </div>
          <div className="mt-4"><FollowButton targetType="match" targetId={match.id} targetName={`${match.homeTeamName} vs ${match.awayTeamName}`} /></div>
          {match.venue ? <p className="mt-4 text-sm text-muted">地点：{match.venue}</p> : null}
        </div>
      </header>
      <DataSourceNote result={result} />
      <MatchEvents events={match.events} stats={match.stats} />
      <section><h2 className="mb-4 text-xl font-black text-ink">比赛阵容</h2><LineupPanel lineups={match.lineups} /></section>
      <TacticalAnalysis summary={match.tacticalSummary} />
    </div>
  );
}

function TeamLink({ id, name }: { id?: string; name: string }) {
  const className = "block break-words font-black text-ink";
  return id ? <Link href={`/data/teams/${id}`} className={`${className} hover:text-brand`}>{name}</Link> : <span className={className}>{name}</span>;
}
