import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationSettingsForm } from "@/components/user/notification-settings";
import { getAuthContext, getMyNotificationSettings } from "@/lib/supabase/queries";

export const metadata = { title: "提醒设置" };
export const dynamic = "force-dynamic";

// 通知页先读取用户保存的开关，浏览器授权由客户端组件在用户点击后触发。
export default async function NotificationsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/auth/login?next=/me/notifications");
  const result = await getMyNotificationSettings(context);
  return (
    <section className="space-y-5 py-4">
      <Link href="/me" className="text-sm font-bold text-brand">← 返回我的</Link>
      <header>
        <h1 className="mt-4 text-3xl font-black text-ink">提醒设置</h1>
        <p className="mt-3 text-sm leading-6 text-muted">管理浏览器通知和赛事提醒偏好。</p>
      </header>
      {result.error ? (
        <p className="rounded-2xl bg-surface p-5 text-sm leading-6 text-red-700">提醒设置暂时无法读取，请确认 Supabase 数据库迁移已执行。</p>
      ) : (
        <NotificationSettingsForm initialSettings={result.data} />
      )}
    </section>
  );
}
