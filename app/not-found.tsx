import Link from "next/link";

// 找不到路由时提供明确的返回路径，避免用户停留在没有下一步的空白页。
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">404</p>
        <h1 className="mt-3 text-3xl font-black text-ink">页面不存在</h1>
        <p className="mt-4 leading-7 text-muted">这个地址暂时没有对应内容，请返回新闻首页继续浏览。</p>
        <Link href="/news" className="mt-7 inline-flex rounded-md bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-[#4f0664]">
          返回新闻首页
        </Link>
      </section>
    </main>
  );
}
