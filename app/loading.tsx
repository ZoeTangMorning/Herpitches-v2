// Next.js 在页面数据准备期间会自动显示这个轻量加载状态。
export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6" aria-busy="true">
      <div className="flex items-center gap-3 text-sm font-semibold text-muted">
        <span className="h-3 w-3 animate-pulse rounded-full bg-brand" aria-hidden="true" />
        正在加载 HerPitches
      </div>
    </main>
  );
}
