"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeRedirectPath } from "@/lib/auth/redirects";

type LoginFormProps = {
  nextPath?: string;
  initialError?: string;
};

// 客户端只调用公开 Supabase key，Magic Link 会把用户带回服务端回调路由。
export function LoginForm({ nextPath, initialError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(initialError ? "登录链接无效或已过期，请重新发送。" : "");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured()) return setError("Supabase 尚未配置，请先填写本地环境变量。");
    if (!email.includes("@")) return setError("请输入有效的邮箱地址。");
    setSending(true);
    setError("");
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeRedirectPath(nextPath))}`;
    const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback },
    });
    setSending(false);
    if (authError) return setError("登录链接发送失败，请检查网络后重试。");
    setMessage("登录链接已发送，请检查邮箱。");
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-panel">
      <label className="block text-sm font-bold text-ink" htmlFor="email">邮箱地址</label>
      <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="w-full rounded-xl border border-line px-3 py-3 text-sm outline-none focus:border-brand" required />
      <button type="submit" disabled={sending} className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{sending ? "发送中…" : "发送登录链接"}</button>
      {message ? <p className="text-sm leading-6 text-brand" role="status">{message}</p> : null}
      {error ? <p className="text-sm leading-6 text-red-700" role="alert">{error}</p> : null}
    </form>
  );
}
