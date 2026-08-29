"use client";

import Link from "next/link";
import { BackButton } from "@/components/layout/back-button";
import { mobileShellClassName } from "@/components/layout/mobile-shell";

// 站点头部保持移动端壳层宽度，主导航统一放在底部。
export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className={`${mobileShellClassName} flex h-14 items-center gap-3`}>
        <BackButton />
        <Link href="/news" className="text-lg font-black tracking-normal text-brand">
          HerPitches
        </Link>
      </div>
    </header>
  );
}
