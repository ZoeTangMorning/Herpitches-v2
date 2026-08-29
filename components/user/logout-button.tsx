"use client";

import { useState } from "react";

// 退出操作请求服务端清理会话，再回到公开新闻页。
export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/news";
  }

  return <button type="button" onClick={logout} disabled={busy} className="w-full rounded-xl border border-line px-4 py-3 text-sm font-bold text-muted hover:border-brand hover:text-brand disabled:opacity-60">{busy ? "退出中…" : "退出登录"}</button>;
}
