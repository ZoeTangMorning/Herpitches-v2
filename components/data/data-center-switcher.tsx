"use client";

import { useState } from "react";
import { DataSourceNote, EmptyState } from "@/components/data/data-state";
import { FixtureCard } from "@/components/data/fixture-card";
import { StandingsTable } from "@/components/data/standings-table";
import { TeamCard } from "@/components/data/team-card";
import type { ApiResult } from "@/types/api";
import type { Fixture, StandingRow, Team } from "@/types/wsl";

type DataCenterTab = "fixtures" | "standings" | "teams";

type DataCenterSwitcherProps = {
  fixtures: ApiResult<Fixture[]>;
  standings: ApiResult<StandingRow[]>;
  teams: ApiResult<Team[]>;
};

const tabs: { id: DataCenterTab; label: string }[] = [
  { id: "fixtures", label: "赛程" },
  { id: "standings", label: "积分榜" },
  { id: "teams", label: "球队" },
];

export function DataCenterSwitcher({ fixtures, standings, teams }: DataCenterSwitcherProps) {
  const [activeTab, setActiveTab] = useState<DataCenterTab>("fixtures");

  return (
    <div className="space-y-6">
      <nav aria-label="数据中心切换" className="rounded-2xl border border-[#d9c1e3] bg-[#efe3f5] p-1 shadow-panel">
        <div className="grid grid-cols-3 divide-x divide-[#d8c4e0] overflow-hidden rounded-[14px]">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-12 items-center justify-center px-3 text-sm font-black transition-all duration-300 ease-out ${
                  active ? "bg-[#8a4ca5] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" : "bg-transparent text-brand hover:bg-white/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div key={activeTab} className="data-panel-enter">
        {activeTab === "fixtures" ? <FixturesPanel result={fixtures} /> : null}
        {activeTab === "standings" ? <StandingsPanel result={standings} /> : null}
        {activeTab === "teams" ? <TeamsPanel result={teams} /> : null}
      </div>
    </div>
  );
}

function FixturesPanel({ result }: { result: ApiResult<Fixture[]> }) {
  return (
    <section className="space-y-4">
      <PanelTitle title="赛程" description="按时间查看 WSL 赛程、比分和比赛详情。" />
      <DataSourceNote result={result} />
      <div className="grid gap-4">
        {result.data.length ? result.data.map((fixture) => <FixtureCard key={fixture.id} fixture={fixture} />) : <EmptyState title="暂无赛程" description="当前赛季还没有可展示的比赛。" />}
      </div>
    </section>
  );
}

function StandingsPanel({ result }: { result: ApiResult<StandingRow[]> }) {
  return (
    <section className="space-y-4">
      <PanelTitle title="积分榜" description="查看球队排名、战绩、净胜球和积分。" />
      <DataSourceNote result={result} />
      {result.data.length ? <StandingsTable rows={result.data} /> : <EmptyState title="暂无积分榜" description="当前赛季的积分数据还没有准备好。" />}
    </section>
  );
}

function TeamsPanel({ result }: { result: ApiResult<Team[]> }) {
  return (
    <section className="space-y-4">
      <PanelTitle title="球队" description="浏览球队资料、近期比赛和球员名单。" />
      <DataSourceNote result={result} />
      <div className="grid gap-4">
        {result.data.length ? result.data.map((team) => <TeamCard key={team.id} team={team} />) : <EmptyState title="暂无球队" description="球队资料还没有可展示内容。" />}
      </div>
    </section>
  );
}

function PanelTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-xl font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
