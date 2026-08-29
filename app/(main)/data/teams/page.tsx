import { DataSourceNote, EmptyState } from "@/components/data/data-state";
import { DataTabs } from "@/components/data/data-tabs";
import { TeamCard } from "@/components/data/team-card";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";

export const metadata = { title: "球队" };

// 球队列表页只使用内部 Team 类型，卡片组件负责单个球队的视觉展示。
export default async function TeamsPage() {
  const result = await getWslApiAdapter().getTeams();
  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <h1 className="mt-4 text-3xl font-black text-ink">球队</h1>
        <p className="mt-4 text-base leading-7 text-muted">浏览球队资料、近期比赛和球员名单。</p>
        <DataTabs />
      </header>
      <DataSourceNote result={result} />
      <section className="grid gap-4">
        {result.data.length ? result.data.map((team) => <TeamCard key={team.id} team={team} />) : <EmptyState title="暂无球队" description="球队资料还没有可展示内容。" />}
      </section>
    </div>
  );
}
