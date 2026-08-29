import Link from "next/link";
import { TeamBadge } from "@/components/data/team-badge";
import { formatDateTime } from "@/lib/formatters/date";
import { formatFixtureStatus, formatScore } from "@/lib/formatters/score";
import type { Fixture } from "@/types/wsl";

type FixtureCardProps = {
  fixture: Fixture;
};

// 比赛卡片只接收项目内部 Fixture 类型，不认识 TheSportsDB 的原始字段。
export function FixtureCard({ fixture }: FixtureCardProps) {
  return (
    <article className="rounded-md border border-line bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand">{formatFixtureStatus(fixture.status)}</p>
          <p className="mt-1 text-sm text-muted">{formatDateTime(fixture.startsAt)}</p>
        </div>
        <Link href={`/data/matches/${fixture.id}`} className="shrink-0 rounded-md px-3 py-2 text-sm font-bold text-brand hover:bg-surface">
          详情
        </Link>
      </div>
      <div className="mt-5 space-y-3">
        <TeamName id={fixture.homeTeamId} name={fixture.homeTeamName} />
        <div className="rounded-md bg-surface px-3 py-2 text-center text-lg font-black text-ink">{formatScore(fixture)}</div>
        <TeamName id={fixture.awayTeamId} name={fixture.awayTeamName} />
      </div>
      {fixture.venue ? <p className="mt-4 text-sm text-muted">地点：{fixture.venue}</p> : null}
    </article>
  );
}

function TeamName({ id, name }: { id?: string; name: string }) {
  const className = "block break-words text-sm font-bold leading-6 text-ink";
  const badgeSrc = id ? `/images/team-badges/${id}.png` : undefined;
  return id ? (
    <Link href={`/data/teams/${id}`} className={`${className} flex items-center gap-3 hover:text-brand`}>
      <TeamBadge label={name} src={badgeSrc} className="h-12 w-12" />
      <span className="min-w-0">{name}</span>
    </Link>
  ) : (
    <p className={`${className} flex items-center gap-3`}>
      <TeamBadge label={name} className="h-12 w-12" />
      <span className="min-w-0">{name}</span>
    </p>
  );
}
