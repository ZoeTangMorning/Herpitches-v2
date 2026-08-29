import Link from "next/link";
import { navigationItems } from "@/lib/constants/navigation";

type DesktopNavigationProps = { pathname: string };

// 桌面端使用顶部导航；pathname 由外层布局传入，组件本身不负责读取路由状态。
export function DesktopNavigation({ pathname }: DesktopNavigationProps) {
  return (
    <nav aria-label="主导航" className="hidden md:flex md:items-center md:gap-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              active ? "bg-brand text-white" : "text-muted hover:bg-surface hover:text-brand"
            }`}
          >
            <Icon aria-hidden="true" size={17} strokeWidth={2.2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
