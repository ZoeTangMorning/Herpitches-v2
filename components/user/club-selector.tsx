"use client";

import { useState } from "react";
import { TeamBadge } from "@/components/data/team-badge";
import type { Team } from "@/types/wsl";

type ClubSelectorProps = {
  teams: Team[];
  returnTo: string;
};

// 选择器只提交内部 teamId，不把整条球队对象发给个人资料接口。
export function ClubSelector({ teams, returnTo }: ClubSelectorProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function choose(team: Team | null) {
    const teamId = team?.id ?? "";
    setSaving(teamId);
    setError("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mainTeamId: teamId }),
    });
    if (!response.ok) {
      setSaving(null);
      setError("主队保存失败，请稍后重试。");
      return;
    }
    window.location.href = returnTo;
  }

  return (
    <div className="space-y-3">
      {teams.length ? teams.map((team) => (
        <button key={team.id} type="button" disabled={Boolean(saving)} onClick={() => choose(team)} className="flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left shadow-panel hover:border-brand disabled:opacity-60">
          <TeamBadge label={team.name} src={team.badgeUrl ?? `/images/team-badges/${team.id}.png`} className="h-12 w-12" />
          <span className="min-w-0"><strong className="block break-words text-sm text-ink">{team.name}</strong><span className="mt-1 block text-xs text-muted">{team.leagueName}</span></span>
        </button>
      )) : <p className="rounded-2xl bg-surface p-5 text-sm text-muted">暂无可选球队。</p>}
      <button type="button" onClick={() => choose(null)} disabled={Boolean(saving)} className="w-full rounded-xl px-4 py-3 text-sm font-bold text-muted hover:bg-surface disabled:opacity-60">暂时跳过</button>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
