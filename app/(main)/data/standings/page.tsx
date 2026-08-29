import { DataSourceNote, EmptyState } from "@/components/data/data-state";
import { DataTabs } from "@/components/data/data-tabs";
import { StandingsTable } from "@/components/data/standings-table";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import { DEFAULT_SEASON } from "@/lib/wsl-api/constants";

export const metadata = { title: "积分榜" };

// 积分榜页面只负责加载当前赛季并交给表格组件展示。
export default async function StandingsPage() {
  const result = await getWslApiAdapter().getStandings({ season: DEFAULT_SEASON });
  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <h1 className="mt-4 text-3xl font-black text-ink">积分榜</h1>
        <p className="mt-4 text-base leading-7 text-muted">{DEFAULT_SEASON} 赛季球队排名、战绩、进失球和积分。</p>
        <DataTabs />
      </header>
      <DataSourceNote result={result} />
      {result.data.length ? <StandingsTable rows={result.data} /> : <EmptyState title="暂无积分榜" description="当前赛季的积分数据还没有准备好。" />}
    </div>
  );
}
