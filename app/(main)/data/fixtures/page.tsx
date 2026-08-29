import { DataSourceNote, EmptyState } from "@/components/data/data-state";
import { DataTabs } from "@/components/data/data-tabs";
import { FixtureCard } from "@/components/data/fixture-card";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import { DEFAULT_SEASON } from "@/lib/wsl-api/constants";

export const metadata = { title: "赛程赛果" };

// 赛程页展示适配器返回的内部 Fixture，不让页面接触供应商字段。
export default async function FixturesPage() {
  const result = await getWslApiAdapter().getFixtures({ season: DEFAULT_SEASON });
  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <h1 className="mt-4 text-3xl font-black text-ink">赛程赛果</h1>
        <p className="mt-4 text-base leading-7 text-muted">查看 {DEFAULT_SEASON} 赛季的比赛时间、对阵、状态和比分。</p>
        <DataTabs />
      </header>
      <DataSourceNote result={result} />
      <section className="grid gap-4">
        {result.data.length ? result.data.map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />) : <EmptyState title="暂无赛程" description="当前赛季还没有可展示的比赛。" />}
      </section>
    </div>
  );
}
