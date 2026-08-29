import type { NextConfig } from "next";

// 这个配置文件集中放置 Next.js 的工程级开关。
// 第一组暂时不接入远程图片域名，后续接入真实图片服务时再补充配置。
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  // 在服务器层直接重定向根路径，保证 HTTP 客户端也能得到 307 状态。
  async redirects() {
    return [{ source: "/", destination: "/news", permanent: false }];
  },
};

export default nextConfig;
