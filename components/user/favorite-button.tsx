"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

type FavoriteButtonProps = {
  articleId: string;
  articleTitle: string;
  articleCoverUrl?: string;
  articleType?: string;
};

// 收藏按钮只提交文章的内部字段，服务端会再次检查当前登录用户。
export function FavoriteButton({
  articleId,
  articleTitle,
  articleCoverUrl,
  articleType,
}: FavoriteButtonProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "login" | "error">("idle");

  async function save() {
    if (status === "saved") return;
    setStatus("saving");
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, articleTitle, articleCoverUrl, articleType }),
    });
    if (response.ok) return setStatus("saved");
    setStatus(response.status === 401 ? "login" : "error");
  }

  const label = status === "saving" ? "收藏中…" : status === "saved" ? "已收藏" : status === "login" ? "请先登录" : status === "error" ? "重试收藏" : "收藏";
  return (
    <button
      type="button"
      onClick={save}
      disabled={status === "saving"}
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 font-bold disabled:opacity-60"
    >
      <Bookmark size={16} aria-hidden="true" fill={status === "saved" ? "currentColor" : "none"} />
      <span>{label}</span>
    </button>
  );
}
