"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import type { LikeTargetType } from "@/types/community";

type LikeButtonProps = {
  targetType: LikeTargetType;
  targetId: string;
  initialCount: number;
  initiallyLiked?: boolean;
  compact?: boolean;
};

// 点赞按钮只访问内部 API，不直接接触数据库或 Supabase client。
export function LikeButton({ targetType, targetId, initialCount, initiallyLiked = false, compact = false }: LikeButtonProps) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [count, setCount] = useState(initialCount);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    setMessage("");
    const response = await fetch(buildUrl(), {
      method: liked ? "DELETE" : "POST",
      headers: liked ? undefined : { "Content-Type": "application/json" },
      body: liked ? undefined : JSON.stringify({ targetType, targetId }),
    });
    setBusy(false);
    if (response.status === 401) return setMessage("请先登录");
    if (!response.ok) return setMessage("操作失败");
    const payload = await response.json();
    setLiked(Boolean(payload.data?.likedByMe));
    setCount(Number(payload.data?.likeCount ?? count));
  }

  function buildUrl() {
    const params = new URLSearchParams({ targetType, targetId });
    return liked ? `/api/interactions?${params.toString()}` : "/api/interactions";
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1 rounded-full bg-surface font-bold text-muted disabled:opacity-60 ${compact ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"}`}
    >
      <Heart size={16} aria-hidden="true" fill={liked ? "currentColor" : "none"} />
      <span>{message || count}</span>
    </button>
  );
}
