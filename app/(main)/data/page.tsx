import { DataCenterSwitcher } from "@/components/data/data-center-switcher";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import { DEFAULT_SEASON } from "@/lib/wsl-api/constants";

export const metadata = { title: "数据" };

export default async function DataPage() {
  const adapter = getWslApiAdapter();
  const [fixtures, standings, teams] = await Promise.all([
    adapter.getFixtures({ season: DEFAULT_SEASON }),
    adapter.getStandings({ season: DEFAULT_SEASON }),
    adapter.getTeams(),
  ]);

  return (
    <section className="space-y-6 py-4">
      <header>
        <h1 className="text-3xl font-black text-ink">数据中心</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">赛程、积分榜和球队入口集中在这里。</p>
      </header>
      <DataCenterSwitcher fixtures={fixtures} standings={standings} teams={teams} />
    </section>
  );
}
