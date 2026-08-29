type ModulePageProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

// 五个入口目前都是工程基础阶段的占位页，共享这个小组件可保持结构一致。
export function ModulePage({ eyebrow, title, description }: ModulePageProps) {
  return (
    <section aria-labelledby="module-title" className="py-10">
      {eyebrow ? <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p> : null}
      <h1 id="module-title" className="text-3xl font-black text-ink">{title}</h1>
      <p className="mt-5 text-base leading-7 text-muted">{description}</p>
      <div className="mt-10 border-l-4 border-brand bg-surface px-5 py-4 text-sm leading-6 text-ink">
        工程基础已就绪，相关功能将在后续开发组别中接入。
      </div>
    </section>
  );
}
