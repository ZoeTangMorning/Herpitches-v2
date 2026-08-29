"use client";

import Link from "next/link";
import { useState } from "react";
import type { FollowRecord, FollowTargetType } from "@/types/user";

type FollowListProps = {
  records: FollowRecord[];
};

const labels: Record<FollowTargetType, string> = { team: "球队", player: "球员", match: "赛事" };

// 客户端只负责删除用户主动点选的记录，查询和权限仍由服务端接口控制。
export function FollowList({ records }: FollowListProps) {
  const [items, setItems] = useState(records);
  const [error, setError] = useState("");

  async function remove(id: string) {
    const response = await fetch(`/api/follows?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) return setError("取消关注失败，请稍后重试。");
    setItems((current) => current.filter((item) => item.id !== id));
  }

  if (!items.length) return <EmptyState />;
  return (
    <div className="space-y-5">
      {(["team", "player", "match"] as FollowTargetType[]).map((type) => {
        const group = items.filter((item) => item.targetType === type);
        if (!group.length) return null;
        return <section key={type}><h2 className="mb-3 text-lg font-black text-ink">{labels[type]}</h2><div className="space-y-3">{group.map((item) => <FollowRow key={item.id} item={item} onRemove={remove} />)}</div></section>;
      })}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

function FollowRow({ item, onRemove }: { item: FollowRecord; onRemove: (id: string) => void }) {
  const href = item.targetType === "team" ? `/data/teams/${item.targetId}` : item.targetType === "player" ? `/data/players/${item.targetId}` : `/data/matches/${item.targetId}`;
  return <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-panel"><Link href={href} className="min-w-0 break-words font-bold text-ink hover:text-brand">{item.targetName}</Link><button type="button" onClick={() => onRemove(item.id)} className="shrink-0 text-sm font-bold text-muted hover:text-red-700">取消</button></div>;
}

function EmptyState() {
  return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">还没有关注任何对象。</p>;
}
