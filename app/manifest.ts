import type { MetadataRoute } from "next";

// manifest 描述浏览器安装 PWA 时需要知道的应用名称、颜色和图标位置。
// 图标文件当前是 public/icons 中的工程占位文件，后续视觉阶段替换为正式品牌图标。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HerPitches | WSL 女足资讯",
    short_name: "HerPitches",
    description: "关注英格兰女子超级联赛的新闻、赛程和基础数据。",
    start_url: "/news",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#64077E",
    lang: "zh-CN",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
