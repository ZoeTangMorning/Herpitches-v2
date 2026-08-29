import type { Config } from "tailwindcss";

// 颜色变量与 globals.css 中的 CSS 变量保持一致，方便后续组件复用品牌主题。
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#64077E",
        ink: "#241B26",
        muted: "#6F6572",
        surface: "#F8F6F9",
        line: "#E8E1EA",
      },
      boxShadow: {
        panel: "0 8px 24px rgba(36, 27, 38, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
