import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { mobileShellClassName } from "@/components/layout/mobile-shell";
import { SiteHeader } from "@/components/layout/site-header";

// 这个布局包住五个一级入口，让它们共享同一套头部、底部导航和页面宽度。
export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <SiteHeader />
      <main className={`${mobileShellClassName} min-h-[calc(100vh-8.5rem)] py-6`}>{children}</main>
      <BottomNavigation />
    </div>
  );
}
