import Link from "next/link";
import { mobileShellClassName } from "@/components/layout/mobile-shell";

export const metadata = { title: "离线模式" };

export default function OfflinePage() {
  return (
    <main className={mobileShellClassName}>
      <section className="space-y-5 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">PWA</p>
        <h1 className="text-3xl font-black text-ink">当前没有网络</h1>
        <p className="text-sm leading-7 text-muted">你可以继续浏览已经打开过的缓存页面；重新连网后刷新即可恢复最新内容。</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/news" className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white">
            返回新闻
          </Link>
          <Link href="/data" className="rounded-xl border border-line px-5 py-3 text-sm font-bold text-brand">
            查看数据
          </Link>
        </div>
      </section>
    </main>
  );
}
