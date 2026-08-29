import type { MatchEvent, MatchStat } from "@/types/wsl";

type MatchEventsProps = {
  events: MatchEvent[];
  stats: MatchStat[];
};

// 比赛事件和技术统计都可能缺失，所以组件要给出明确空状态。
export function MatchEvents({ events, stats }: MatchEventsProps) {
  return (
    <div className="grid gap-4">
      <section className="rounded-md border border-line bg-white p-4 shadow-panel">
        <h3 className="text-base font-black text-ink">比赛事件</h3>
        {events.length ? (
          <ol className="mt-4 space-y-3">
            {events.map((event, index) => (
              <li key={`${event.type}-${index}`} className="border-l-4 border-brand bg-surface px-3 py-2 text-sm">
                <span className="font-black text-brand">{event.minute ? `${event.minute}'` : "时间待定"}</span>
                <span className="ml-2 font-bold text-ink">{event.type}</span>
                <p className="mt-1 text-muted">{[event.teamName, event.playerName].filter(Boolean).join(" · ") || "详情待补充"}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-muted">比赛事件暂未提供。</p>
        )}
      </section>
      <section className="rounded-md border border-line bg-white p-4 shadow-panel">
        <h3 className="text-base font-black text-ink">技术统计</h3>
        <div className="mt-4 space-y-2">
          {stats.length ? stats.map((stat) => <StatRow key={stat.name} stat={stat} />) : <p className="text-sm text-muted">技术统计暂未提供。</p>}
        </div>
      </section>
    </div>
  );
}

function StatRow({ stat }: { stat: MatchStat }) {
  return (
    <div className="grid grid-cols-[1fr_1.3fr_1fr] items-center gap-2 rounded-md bg-surface px-3 py-2 text-sm">
      <span className="font-black text-ink">{stat.homeValue ?? "-"}</span>
      <span className="text-center text-muted">{stat.name}</span>
      <span className="text-right font-black text-ink">{stat.awayValue ?? "-"}</span>
    </div>
  );
}
