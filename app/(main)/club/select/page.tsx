import { redirect } from "next/navigation";
import { ClubSelector } from "@/components/user/club-selector";
import { getAuthContext } from "@/lib/supabase/queries";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import { safeRedirectPath } from "@/lib/auth/redirects";

type ClubSelectPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata = { title: "选择主队" };

// 只有登录用户可以保存主队，球队列表仍从统一 WSL 适配器读取。
export default async function ClubSelectPage({ searchParams }: ClubSelectPageProps) {
  const context = await getAuthContext();
  if (!context) redirect(`/auth/login?next=${encodeURIComponent("/club/select")}`);
  const teams = await getWslApiAdapter().getTeams();
  const params = await searchParams;
  return (
    <section className="space-y-6 py-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">主队设置</p>
          <h1 className="mt-2 text-3xl font-black text-ink">选择主队</h1>
          <p className="mt-3 text-sm leading-6 text-muted">选择一支球队，之后可以在主队入口快速查看它的内容。</p>
        </div>
        <ClubSelector teams={teams.data} returnTo={safeRedirectPath(params.next, "/club")} />
    </section>
  );
}
