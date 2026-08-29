import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

type CookieStoreLike = {
  getAll(): Array<{ name: string; value: string }>;
};

type JwtClaims = {
  sub?: string;
  email?: string;
  aud?: string;
  app_metadata?: User["app_metadata"];
  user_metadata?: User["user_metadata"];
  created_at?: string;
  updated_at?: string;
  role?: string;
  phone?: string;
  identities?: User["identities"];
  factors?: User["factors"];
  is_anonymous?: boolean;
  is_sso_user?: boolean;
};

const BASE64_PREFIX = "base64-";

// 只要没有 Supabase 会话 cookie，就没必要去远程查用户身份。
export function hasSupabaseSessionCookie(cookieStore: CookieStoreLike) {
  return cookieStore.getAll().some(({ name }) => name.includes("-auth-token"));
}

export function getSupabaseSessionStorageKey() {
  const { url } = getSupabaseConfig();
  if (!url) return "";
  try {
    return `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  } catch {
    return "";
  }
}

export async function readSupabaseSession(cookieStore: CookieStoreLike): Promise<Session | null> {
  const storageKey = getSupabaseSessionStorageKey();
  if (!storageKey) return null;
  const encoded = await readChunkedCookieValue(cookieStore, storageKey);
  if (!encoded) return null;
  const decoded = decodeCookieValue(encoded);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded) as Session;
  } catch {
    return null;
  }
}

export function sessionUserFromSession(session: Session): User | null {
  const user = session.user;
  if (user && !(user as any).__isInsecureUserWarningProxy) return user;

  const claims = decodeJwtClaims(session.access_token);
  if (!claims?.sub) return null;

  return {
    id: claims.sub,
    aud: claims.aud ?? "authenticated",
    app_metadata: claims.app_metadata ?? {},
    user_metadata: claims.user_metadata ?? {},
    email: claims.email ?? undefined,
    phone: claims.phone ?? undefined,
    created_at: claims.created_at ?? new Date().toISOString(),
    updated_at: claims.updated_at ?? undefined,
    role: claims.role ?? "authenticated",
    identities: claims.identities ?? [],
    factors: claims.factors ?? [],
    is_anonymous: claims.is_anonymous ?? false,
    is_sso_user: claims.is_sso_user ?? false,
  } as User;
}

async function readChunkedCookieValue(cookieStore: CookieStoreLike, key: string) {
  const allCookies = cookieStore.getAll();
  const exact = allCookies.find(({ name }) => name === key);
  if (exact?.value) return exact.value;

  const chunks: string[] = [];
  for (let index = 0; ; index += 1) {
    const chunk = allCookies.find(({ name }) => name === `${key}.${index}`);
    if (!chunk?.value) break;
    chunks.push(chunk.value);
  }

  return chunks.length > 0 ? chunks.join("") : null;
}

function decodeCookieValue(value: string) {
  if (!value.startsWith(BASE64_PREFIX)) return value;
  try {
    return Buffer.from(value.slice(BASE64_PREFIX.length), "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function decodeJwtClaims(accessToken: string): JwtClaims | null {
  const parts = accessToken.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as JwtClaims;
  } catch {
    return null;
  }
}
