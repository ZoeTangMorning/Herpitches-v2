import Link from "next/link";
import type { StandingRow } from "@/types/wsl";

type StandingsTableProps = {
  rows: StandingRow[];
};

// 积分榜在手机上允许横向滚动，避免列太多时挤在一起。
export function StandingsTable({ rows }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-white shadow-panel">
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="bg-surface text-xs font-bold uppercase text-muted">
          <tr>
            {["排名", "球队", "场次", "胜", "平", "负", "进球", "失球", "净胜球", "积分"].map((label) => (
              <th key={label} className="px-3 py-3">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={`${row.rank}-${row.teamName}`} className="text-ink">
              <td className="px-3 py-3 font-black">{row.rank}</td>
              <td className="px-3 py-3 font-bold">
                {row.teamId ? <Link className="hover:text-brand" href={`/data/teams/${row.teamId}`}>{row.teamName}</Link> : row.teamName}
              </td>
              <NumberCell value={row.played} />
              <NumberCell value={row.wins} />
              <NumberCell value={row.draws} />
              <NumberCell value={row.losses} />
              <NumberCell value={row.goalsFor} />
              <NumberCell value={row.goalsAgainst} />
              <NumberCell value={row.goalDifference} />
              <NumberCell value={row.points} strong />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NumberCell({ value, strong }: { value?: number; strong?: boolean }) {
  return <td className={`px-3 py-3 ${strong ? "font-black text-brand" : ""}`}>{typeof value === "number" ? value : "-"}</td>;
}
