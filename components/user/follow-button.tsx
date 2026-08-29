"use client";

import { useState } from "react";
import { createCommunityFromFollow, readCommunityState, upsertCommunity, writeCommunityState } from "@/components/community/community-storage";
import type { FollowTargetType } from "@/types/user";

type FollowButtonProps = {
  targetType: FollowTargetType;
  targetId: string;
  targetName: string;
  targetAvatarUrl?: string;
};

// 关注按钮只提交对象的最小标识，服务端仍会再次验证登录身份。
export function FollowButton({ targetType, targetId, targetName, targetAvatarUrl }: FollowButtonProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function follow() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, targetName }),
    });
    setBusy(false);
    if (response.ok) {
      setMessage("已关注");
      if (targetType === "team" || targetType === "player") {
        const state = readCommunityState();
        const next = upsertCommunity(
          state,
          createCommunityFromFollow({ targetType, targetId, targetName, targetAvatarUrl }),
        );
        writeCommunityState(next);
        window.dispatchEvent(
          new CustomEvent("herpitches-follow", {
            detail: { targetType, targetId, targetName, targetAvatarUrl },
          }),
        );
      }
    } else {
      setMessage(response.status === 401 ? "请先登录" : "关注失败");
    }
  }

  return <button type="button" disabled={busy} onClick={follow} className="rounded-xl border border-brand px-3 py-2 text-sm font-bold text-brand disabled:opacity-60">{busy ? "处理中…" : message || "关注"}</button>;
}
