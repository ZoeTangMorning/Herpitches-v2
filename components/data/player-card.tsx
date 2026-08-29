import Link from "next/link";
import { PlayerAvatar } from "@/components/data/player-avatar";
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
        <PlayerAvatar label={player.name} src={player.avatarUrl} />
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
