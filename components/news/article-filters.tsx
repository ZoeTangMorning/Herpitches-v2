import type { ArticleType } from "@/types/article";

type ArticleFiltersProps = {
  keyword?: string;
  type?: ArticleType | "all";
};

// 筛选器用 GET 表单和普通链接实现，初学者可以把它理解成“用网址记录筛选条件”。
export function ArticleFilters({ keyword, type }: ArticleFiltersProps) {
  const chips = [
    ["全部", "all"],
    ["新闻", "news"],
    ["专题", "feature"],
    ["人物", "profile"],
    ["战术", "tactics"],
  ] as const;
  return (
    <section className="space-y-3 rounded-2xl bg-surface p-3">
      <form action="/news" className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="搜索新闻"
          className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
          defaultValue={keyword}
          name="keyword"
          placeholder="搜索球队、球员或话题"
        />
        <input name="type" type="hidden" value={type ?? "all"} />
        <button className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white sm:w-auto" type="submit">搜索</button>
      </form>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chips.map(([label, value]) => (
          <a key={value} className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold ${type === value ? "bg-brand text-white" : "bg-white text-brand"}`} href={`/news?type=${value}`}>
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
