"use client";

type ErrorPageProps = { error: Error & { digest?: string }; reset: () => void };

// 错误页必须是客户端组件，因为 reset 由 Next.js 注入并需要在浏览器触发重试。
export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="max-w-md text-center" role="alert">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">暂时无法显示</p>
        <h1 className="mt-3 text-3xl font-black text-ink">页面遇到了一点问题</h1>
        <p className="mt-4 leading-7 text-muted">请稍后重试。如果问题持续存在，请检查网络连接。</p>
        <button onClick={reset} className="mt-7 rounded-md bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-[#4f0664]">
          重新加载
        </button>
      </section>
    </main>
  );
}
