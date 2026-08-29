import {
  BarChart3,
  BookOpenText,
  House,
  MessageCircle,
  UserRound,
  type LucideIcon,
} from "lucide-react";

// 所有一级导航都从这里读取，避免桌面导航和移动导航出现两套不一致的文字。
export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { label: "数据", href: "/data", icon: BarChart3 },
  { label: "新闻", href: "/news", icon: BookOpenText },
  { label: "主队", href: "/club", icon: House },
  { label: "社区", href: "/community", icon: MessageCircle },
  { label: "我的", href: "/me", icon: UserRound },
];
