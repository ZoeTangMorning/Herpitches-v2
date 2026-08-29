"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/data/fixtures", label: "赛程" },
  { href: "/data/standings", label: "积分榜" },
  { href: "/data/teams", label: "球队" },
];

// 数据中心的三个入口共用同一组分段按钮，避免页面之间的视觉跳变。
export function DataTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="数据中心切换" className="rounded-2xl border border-[#d9c1e3] bg-[#efe3f5] p-1 shadow-panel">
      <div className="grid grid-cols-3 divide-x divide-[#d8c4e0] overflow-hidden rounded-[14px]">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/data/fixtures" && pathname.startsWith(tab.href)) ||
            (tab.href === "/data/fixtures" && (pathname === "/data" || pathname.startsWith("/data/fixtures") || pathname.startsWith("/data/matches")));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center justify-center px-3 text-sm font-black transition-all duration-300 ease-out ${
                active ? "bg-[#8a4ca5] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" : "bg-transparent text-brand hover:bg-white/60"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
