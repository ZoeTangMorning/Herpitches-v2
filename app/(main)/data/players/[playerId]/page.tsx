import Link from "next/link";
import { notFound } from "next/navigation";
import { DataSourceNote, EmptyState } from "@/components/data/data-state";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import { formatNullableText, formatNumber, formatPlayerName } from "@/lib/formatters/player";
import { FollowButton } from "@/components/user/follow-button";

type PlayerPageProps = {
  params: Promise<{ playerId: string }>;
};

export const metadata = { title: "球员详情" };

// 球员详情通过 teamId 回到球队页；没有关联 ID 时只展示文字，避免无效跳转。
export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const result = await getWslApiAdapter().getPlayer(playerId);
  const player = result.data;
  // 防止无效 ID 被 mock 演示数据误显示成另一名球员。
  if (player.id !== playerId) notFound();
  const stats = player.stats;
  return (
    <div className="space-y-6">
      <header>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-surface text-xl font-black text-brand">
            {player.avatarUrl ? <img src={player.avatarUrl} alt={`${player.name} 头像`} className="h-20 w-20 rounded-md object-cover" /> : player.name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1"><h1 className="break-words text-2xl font-black text-ink">{formatPlayerName(player)}</h1><p className="mt-2 text-sm text-muted">{formatNullableText(player.position)} · {formatNullableText(player.nationality)}</p><div className="mt-3"><FollowButton targetType="player" targetId={player.id} targetName={formatPlayerName(player)} targetAvatarUrl={player.avatarUrl} /></div></div>
        </div>
      </header>
      <DataSourceNote result={result} />
      <section className="rounded-md border border-line bg-white p-5 shadow-panel">
        <h2 className="text-xl font-black text-ink">所属球队</h2>
        {player.teamId ? <Link href={`/data/teams/${player.teamId}`} className="mt-3 inline-block font-bold text-brand">{player.teamName ?? "查看球队详情"}</Link> : <p className="mt-3 text-sm text-muted">所属球队暂未提供。</p>}
      </section>
      <section className="rounded-md border border-line bg-white p-5 shadow-panel">
        <h2 className="text-xl font-black text-ink">基础资料</h2>
        <p className="mt-4 text-sm leading-7 text-muted">{formatNullableText(player.description)}</p>
        <p className="mt-3 text-sm text-muted">出生日期：{formatNullableText(player.bornAt)}</p>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-black text-ink">赛季基础数据</h2>
        {stats ? <div className="grid grid-cols-2 gap-3">{Object.entries({ 出场: stats.appearances, 首发: stats.starts, 进球: stats.goals, 助攻: stats.assists, 黄牌: stats.yellowCards, 红牌: stats.redCards, 出场时间: stats.minutes }).map(([label, value]) => <div key={label} className="rounded-md border border-line bg-white p-4"><p className="text-xl font-black text-brand">{formatNumber(value)}</p><p className="mt-1 text-sm text-muted">{label}</p></div>)}</div> : <EmptyState title="暂无赛季数据" description="当前数据源没有提供这名球员的统计信息。" />}
      </section>
    </div>
  );
}
