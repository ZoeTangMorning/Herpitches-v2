import Link from "next/link";
import { formatNumber, formatPlayerName } from "@/lib/formatters/player";
import type { Player, PlayerDetail } from "@/types/wsl";

type PlayerCardProps = {
  player: Player | PlayerDetail;
  linked?: boolean;
};

// 球员卡片同时用于球队名单和球员详情摘要，通过 linked 控制是否可点击。
export function PlayerCard({ player, linked = true }: PlayerCardProps) {
  const content = (
    <div className="rounded-md border border-line bg-white p-4 shadow-panel">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-surface text-sm font-black text-brand">
          {player.avatarUrl ? <img src={player.avatarUrl} alt={`${player.name} 头像`} className="h-14 w-14 rounded-md object-cover" /> : player.name.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-ink">{formatPlayerName(player)}</h3>
          <p className="mt-1 truncate text-sm text-muted">{player.position ?? "位置待定"}</p>
        </div>
      </div>
      {"stats" in player && player.stats ? (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <Stat label="出场" value={formatNumber(player.stats.appearances)} />
          <Stat label="进球" value={formatNumber(player.stats.goals)} />
          <Stat label="助攻" value={formatNumber(player.stats.assists)} />
        </div>
      ) : null}
    </div>
  );
  return linked && player.id ? <Link href={`/data/players/${player.id}`} className="block hover:text-brand">{content}</Link> : content;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface px-2 py-2">
      <p className="font-black text-ink">{value}</p>
      <p className="mt-1 text-muted">{label}</p>
    </div>
  );
}
