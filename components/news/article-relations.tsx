import Link from "next/link";
import type { ArticleRelation } from "@/types/article";

type ArticleRelationsProps = {
  relations: ArticleRelation[];
};

export function ArticleRelations({ relations }: ArticleRelationsProps) {
  if (!relations.length) return null;
  return (
    <section className="space-y-3 rounded-2xl bg-surface p-4">
      <h2 className="text-base font-black text-ink">关联入口</h2>
      <div className="flex flex-wrap gap-2">
        {relations.map((relation, index) => {
          if (relation.teamId) return <Link key={`${relation.teamId}-${index}`} href={`/data/teams/${relation.teamId}`} className="rounded-full bg-white px-3 py-1 text-sm font-bold text-brand">{relation.teamName ?? "球队"}</Link>;
          if (relation.playerId) return <Link key={`${relation.playerId}-${index}`} href={`/data/players/${relation.playerId}`} className="rounded-full bg-white px-3 py-1 text-sm font-bold text-brand">{relation.playerName ?? "球员"}</Link>;
          if (relation.matchId) return <Link key={`${relation.matchId}-${index}`} href={`/data/matches/${relation.matchId}`} className="rounded-full bg-white px-3 py-1 text-sm font-bold text-brand">{relation.matchLabel ?? "比赛"}</Link>;
          return null;
        })}
      </div>
    </section>
  );
}
