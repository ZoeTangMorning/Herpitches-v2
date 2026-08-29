"use client";

import Link from "next/link";
import { useState } from "react";
import type { FavoriteRecord } from "@/types/user";

type FavoriteListProps = {
  records: FavoriteRecord[];
};

// 收藏列表允许用户进入原文章，也允许只删除自己的收藏记录。
export function FavoriteList({ records }: FavoriteListProps) {
  const [items, setItems] = useState(records);
  const [error, setError] = useState("");

  async function remove(id: string) {
    const response = await fetch(`/api/favorites?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) return setError("取消收藏失败，请稍后重试。");
    setItems((current) => current.filter((item) => item.id !== id));
  }

  if (!items.length) return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">还没有收藏新闻。</p>;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-panel">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">{item.articleCoverUrl ? <img src={item.articleCoverUrl} alt="" className="h-full w-full object-cover" /> : null}</div>
          <div className="min-w-0 flex-1"><Link href={`/news/${item.articleId}`} className="block break-words text-sm font-bold leading-6 text-ink hover:text-brand">{item.articleTitle}</Link><p className="mt-1 text-xs text-muted">{item.articleType ?? "新闻"}</p></div>
          <button type="button" onClick={() => remove(item.id)} className="shrink-0 text-xs font-bold text-muted hover:text-red-700">取消</button>
        </article>
      ))}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
