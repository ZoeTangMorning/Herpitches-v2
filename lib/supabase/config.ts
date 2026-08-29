// Supabase 的公共变量会被浏览器端和服务端共同使用，因此统一从这里读取。
export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  };
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.publishableKey);
}

export function assertSupabaseConfig() {
  const config = getSupabaseConfig();
  if (!config.url || !config.publishableKey) {
    throw new Error(
      "Supabase 未配置，请填写 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。",
    );
  }
  return config;
}
