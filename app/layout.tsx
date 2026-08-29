import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HerPitches | WSL 女足资讯",
    template: "%s | HerPitches",
  },
  description: "关注英格兰女子超级联赛的新闻、赛程和基础数据。",
};

export const viewport: Viewport = {
  themeColor: "#64077E",
};

// 根布局只加载全局样式和 HTML 基础结构，不放业务请求，保持所有页面都能复用。
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
