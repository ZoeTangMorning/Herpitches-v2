import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/user/logout-button";
import { getAuthContext, getMyProfile } from "@/lib/supabase/queries";

export const metadata = { title: "我的" };
export const dynamic = "force-dynamic";

// 我的页面是个人功能目录；具体列表由各自的子页面负责加载。
export default async function MePage() {
  const context = await getAuthContext();
  if (!context) redirect("/auth/login?next=/me");
  const profile = await getMyProfile(context);
  return (
    <section className="space-y-5 py-4">
        <header className="rounded-2xl bg-brand p-5 text-white">
          <p className="text-sm font-bold opacity-80">个人空间</p>
          <h1 className="mt-2 break-words text-2xl font-black">{profile.data?.displayName ?? context.user.email ?? "HerPitches 用户"}</h1>
          <p className="mt-2 break-all text-sm opacity-80">{context.user.email ?? "邮箱未提供"}</p>
        </header>
        <div className="grid gap-3">
          <MenuLink href={profile.data?.mainTeamId ? "/club" : "/club/select"} label={profile.data?.mainTeamId ? "我的主队" : "选择主队"} />
          <MenuLink href="/me/follows" label="我的关注" />
          <MenuLink href="/me/favorites" label="我的收藏" />
          <MenuLink href="/me/notifications" label="提醒设置" />
          <MenuLink href="/me/comments" label="我的评论" />
        </div>
        <LogoutButton />
    </section>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 font-bold text-ink shadow-panel hover:border-brand"><span>{label}</span><span aria-hidden="true" className="text-brand">→</span></Link>;
}
