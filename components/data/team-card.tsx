import Link from "next/link";
import { TeamBadge } from "@/components/data/team-badge";
import type { Team, TeamDetail } from "@/types/wsl";

type TeamCardProps = {
  team: Team | TeamDetail;
};

// 球队卡片负责入口展示；真正的数据读取放在页面层完成。
export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/data/teams/${team.id}`} className="group block rounded-md border border-line bg-white p-4 shadow-panel transition-colors hover:border-brand">
      <div className="flex items-center gap-4">
        <TeamBadge label={team.name} src={team.badgeUrl ?? `/images/team-badges/${team.id}.png`} className="h-14 w-14" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-ink group-hover:text-brand">{team.name}</h3>
          <p className="mt-1 truncate text-sm text-muted">{team.country ?? team.leagueName}</p>
        </div>
      </div>
      {"description" in team && team.description ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{team.description}</p> : null}
    </Link>
  );
}
