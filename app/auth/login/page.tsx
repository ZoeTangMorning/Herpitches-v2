import { LoginForm } from "@/components/user/login-form";
import { mobileShellClassName } from "@/components/layout/mobile-shell";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const metadata = { title: "登录" };

// 登录页只收集邮箱，真正的会话由 Supabase Magic Link 回调完成。
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <main className={mobileShellClassName}>
      <section className="space-y-6 py-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">账号</p>
          <h1 className="mt-2 text-3xl font-black text-ink">登录 HerPitches</h1>
          <p className="mt-3 text-sm leading-6 text-muted">输入邮箱，我们会发送一次性登录链接。</p>
        </div>
        <LoginForm nextPath={params.next} initialError={params.error} />
      </section>
    </main>
  );
}
