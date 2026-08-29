import { notFound } from "next/navigation";
import { EmptyState } from "@/components/data/data-state";
import { PlayerAvatar } from "@/components/data/player-avatar";
import { TeamBadge } from "@/components/data/team-badge";
import { formatNullableText, formatNumber } from "@/lib/formatters/player";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import type { PlayerFixture } from "@/types/wsl";

type PlayerPageProps = {
  params: Promise<{ playerId: string }>;
};

export const metadata = { title: "球员详情" };

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const result = await getWslApiAdapter().getPlayer(playerId);
  const player = result.data;

  if (player.id !== playerId) notFound();

  const stats = player.stats;
  const transfers = player.transfers ?? [];
  const recentFixtures = player.recentFixtures ?? [];

  return (
    <article className="space-y-6">
      <header className="rounded-2xl border border-line bg-white p-5 text-center shadow-panel">
        <PlayerAvatar label={player.name} src={player.avatarUrl} className="mx-auto h-28 w-28 rounded-full text-xl shadow-panel" />
        <h1 className="mt-5 break-words text-2xl font-black text-ink">
          {player.originalName}
          {player.shirtNumber !== undefined ? ` | ${player.shirtNumber}号` : ""}
        </h1>
        {player.chineseName ? <p className="mt-2 text-base font-bold text-ink">{player.chineseName}</p> : null}
        <p className="mt-2 text-sm text-muted">
          <NationalityFlag nationality={player.nationality} />{" "}
          {formatNullableText(player.nationality)}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <PlayerFact label="俱乐部" value={player.teamName} />
          <PlayerFact label="位置" value={player.position} />
          <PlayerFact label="身价" value={player.marketValue} />
          <PlayerFact label="出生日期" value={player.bornAt} />
        </dl>
      </header>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
        <h2 className="text-lg font-black text-ink">转会记录</h2>
        {transfers.length ? (
          <ol className="mt-5">
            {transfers.map((transfer, index) => (
              <li key={`${transfer.clubName}-${transfer.from}`} className="relative pb-6 pl-7 last:pb-0">
                {index < transfers.length - 1 ? <span className="absolute left-[5px] top-3 h-full w-px bg-line" aria-hidden="true" /> : null}
                <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-brand ring-4 ring-white" aria-hidden="true" />
                <p className="font-black text-ink">{transfer.clubName}</p>
                <p className="mt-1 text-sm text-muted">
                  {transfer.from} – {transfer.to}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-muted">暂未提供转会记录。</p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
        <h2 className="text-lg font-black text-ink">近期比赛</h2>
        {recentFixtures.length ? (
          <div className="mt-2 divide-y divide-line">
            {recentFixtures.map((fixture) => <RecentPlayerFixture key={fixture.id} fixture={fixture} />)}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">暂未提供近期比赛。</p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
        <h2 className="text-lg font-black text-ink">球员简介</h2>
        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted">{formatNullableText(player.description)}</p>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-ink">赛季基础数据</h2>
          <span className="shrink-0 text-sm font-bold text-muted">{player.statsSeason ?? "2025/26"} ▼</span>
        </div>
        {stats ? (
          <dl className="mt-6 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            {Object.entries({ 出场: stats.appearances, 首发: stats.starts, 进球: stats.goals, 助攻: stats.assists }).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dd className="text-2xl font-black text-brand">{formatNumber(value)}</dd>
                <dt className="mt-2 text-xs font-bold text-muted">{label}</dt>
              </div>
            ))}
          </dl>
        ) : (
          <div className="mt-5">
            <EmptyState title="暂无赛季数据" description="当前数据源没有提供这名球员的统计信息。" />
          </div>
        )}
      </section>
    </article>
  );
}

function NationalityFlag({ nationality }: { nationality?: string }) {
  const flagClassName = "inline-block h-3 w-5 align-[-1px] shadow-[0_0_0_1px_rgba(35,25,38,0.12)]";

  if (nationality === "英格兰") {
    return (
      <svg viewBox="0 0 5 3" role="img" aria-label="英格兰旗" className={flagClassName}>
        <rect width="5" height="3" fill="white" />
        <path d="M0 1.2h5v.6H0zM2.2 0h.6v3h-.6z" fill="#CE1124" />
      </svg>
    );
  }

  if (nationality === "西班牙") {
    return <img src="/images/flags/spain.svg" alt="西班牙旗" className={`${flagClassName} object-cover`} />;
  }

  return <span aria-hidden="true">🌍</span>;
}

function PlayerFact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0 px-0.5">
      <dt className="text-[11px] font-bold text-muted">{label}</dt>
      <dd className="mt-2 break-words text-xs font-black leading-5 text-ink">{formatNullableText(value)}</dd>
    </div>
  );
}

function RecentPlayerFixture({ fixture }: { fixture: PlayerFixture }) {
  return (
    <article className="py-7 text-center">
      <p className="text-sm font-black text-ink">{fixture.dateLabel} · {fixture.timeLabel}</p>
      <p className="mt-2 text-xs font-bold text-muted">{fixture.leagueName}</p>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <FixtureTeam name={fixture.homeTeamName} badgeUrl={fixture.homeTeamBadgeUrl} />
        <span className="text-sm font-black text-muted">VS</span>
        <FixtureTeam name={fixture.awayTeamName} badgeUrl={fixture.awayTeamBadgeUrl} />
      </div>
    </article>
  );
}

function FixtureTeam({ name, badgeUrl }: { name: string; badgeUrl?: string }) {
  return (
    <div className="min-w-0">
      <TeamBadge label={name} src={badgeUrl} className="mx-auto h-14 w-14 rounded-full" />
      <p className="mt-2 truncate text-sm font-black text-ink">{name}</p>
    </div>
  );
}
