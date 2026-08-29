import Link from "next/link";
import type { LineupPlayer } from "@/types/wsl";

type LineupPanelProps = {
  lineups: LineupPlayer[];
};

// 阵容里只有存在 playerId 的球员才给跳转，避免点到没有详情页的数据。
export function LineupPanel({ lineups }: LineupPanelProps) {
  if (!lineups.length) {
    return <p className="rounded-md border border-line bg-surface p-4 text-sm text-muted">阵容暂未提供。</p>;
  }
  const groups = groupByTeam(lineups);
  return (
    <div className="grid gap-4">
      {groups.map(([teamName, players]) => (
        <section key={teamName} className="rounded-md border border-line bg-white p-4 shadow-panel">
          <h3 className="text-base font-black text-ink">{teamName}</h3>
          <div className="mt-4 grid gap-2">
            {players.map((player, index) => (
              <PlayerRow key={`${player.playerName}-${index}`} player={player} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupByTeam(lineups: LineupPlayer[]) {
  const map = new Map<string, LineupPlayer[]>();
  lineups.forEach((player) => {
    const key = player.teamName ?? "未标明球队";
    map.set(key, [...(map.get(key) ?? []), player]);
  });
  return Array.from(map.entries());
}

function PlayerRow({ player }: { player: LineupPlayer }) {
  const text = (
    <span className="flex items-center justify-between gap-3 rounded-md bg-surface px-3 py-2 text-sm">
      <span className="break-words font-bold text-ink">{player.playerName}</span>
      <span className="text-muted">{player.position ?? "位置待定"}</span>
    </span>
  );
  return player.playerId ? <Link href={`/data/players/${player.playerId}`} className="hover:text-brand">{text}</Link> : text;
}
