"use client";

import { useEffect, useState } from "react";
import type { NotificationSettings } from "@/types/user";

type NotificationSettingsFormProps = {
  initialSettings: NotificationSettings;
};

// 通知权限必须由用户主动点击触发，页面加载时不能擅自弹出浏览器授权框。
export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const permission = typeof Notification === "undefined" ? "unsupported" : Notification.permission;
    setSettings((current) => ({ ...current, browserPermission: permission }));
  }, []);

  async function requestPermission() {
    if (typeof Notification === "undefined") return setError("当前浏览器不支持通知。");
    const permission = await Notification.requestPermission();
    await save({ browserPermission: permission });
  }

  async function save(patch: Partial<NotificationSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setError("");
    setMessage("");
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ browserPermission: next.browserPermission, followReminders: next.followReminders, majorMatchReminders: next.majorMatchReminders }),
    });
    if (!response.ok) return setError("设置保存失败，请稍后重试。");
    setMessage("设置已保存。");
  }

  return (
    <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="font-black text-ink">浏览器通知</h2><p className="mt-1 text-sm text-muted">当前状态：{permissionLabel(settings.browserPermission)}</p></div>
        <button type="button" onClick={requestPermission} className="shrink-0 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white">授权</button>
      </div>
      <Toggle label="关注对象提醒" checked={settings.followReminders} onChange={(checked) => save({ followReminders: checked })} />
      <Toggle label="重大赛事提醒" checked={settings.majorMatchReminders} onChange={(checked) => save({ majorMatchReminders: checked })} />
      {message ? <p role="status" className="text-sm text-brand">{message}</p> : null}
      {error ? <p role="alert" className="text-sm leading-6 text-red-700">{error}</p> : null}
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 border-t border-line py-3 text-sm font-bold text-ink"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-brand" /></label>;
}

function permissionLabel(permission: NotificationSettings["browserPermission"]) {
  return { default: "未授权", granted: "已授权", denied: "已拒绝", unsupported: "浏览器不支持" }[permission];
}
