// 只允许站内相对路径，避免登录回调被利用来跳到陌生网站。
export function safeRedirectPath(value?: string | null, fallback = "/me") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
