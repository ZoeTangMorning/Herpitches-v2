import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { hasSupabaseSessionCookie, readSupabaseSession, sessionUserFromSession } from "@/lib/supabase/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FavoriteRecord, FollowRecord, FollowTargetType, NotificationSettings, UserProfile } from "@/types/user";

type Row = Record<string, any>;
export type AuthContext = { client: SupabaseClient; user: User };

// 所有个人数据查询先经过这里，确保页面和接口都使用同一个登录用户。
export async function getAuthContext(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  if (!hasSupabaseSessionCookie(cookieStore)) return null;
  const client = await createSupabaseServerClient(cookieStore);
  const { data } = await client.auth.getUser();
  return data.user ? { client, user: data.user } : null;
}

// 发帖写入链路只需要本地 cookie 中的 session，不需要再打一次 Supabase Auth。
export async function getFastAuthContext(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  if (!hasSupabaseSessionCookie(cookieStore)) return null;
  const client = await createSupabaseServerClient(cookieStore);
  const session = await readSupabaseSession(cookieStore);
  if (!session) return null;
  const user = sessionUserFromSession(session);
  return user ? { client, user } : null;
}

export async function getMyProfile(context: AuthContext) {
  const { data, error } = await context.client.from("profiles").select("*").eq("id", context.user.id).maybeSingle();
  return { data: data ? mapProfile(data) : null, error: error?.message };
}

export async function saveMyProfile(context: AuthContext, mainTeamId: string | null, completed = true) {
  const { data, error } = await context.client.from("profiles").upsert({ id: context.user.id, main_team_id: mainTeamId, has_completed_onboarding: completed, updated_at: new Date().toISOString() }).select().single();
  return { data: data ? mapProfile(data) : null, error: error?.message };
}

export async function getMyFollows(context: AuthContext) {
  const { data, error } = await context.client.from("follows").select("*").eq("user_id", context.user.id).order("created_at", { ascending: false });
  return { data: (data ?? []).map(mapFollow), error: error?.message };
}

export async function addFollow(context: AuthContext, input: { targetType: FollowTargetType; targetId: string; targetName: string }) {
  const { data, error } = await context.client.from("follows").insert({ user_id: context.user.id, target_type: input.targetType, target_id: input.targetId, target_name: input.targetName }).select().single();
  return { data: data ? mapFollow(data) : null, error: error?.message };
}

export async function removeFollow(context: AuthContext, id: string) {
  const { error } = await context.client.from("follows").delete().eq("id", id).eq("user_id", context.user.id);
  return { error: error?.message };
}

export async function getMyFavorites(context: AuthContext) {
  const { data, error } = await context.client.from("favorites").select("*").eq("user_id", context.user.id).order("created_at", { ascending: false });
  return { data: (data ?? []).map(mapFavorite), error: error?.message };
}

export async function addFavorite(context: AuthContext, input: { articleId: string; articleTitle: string; articleCoverUrl?: string; articleType?: string }) {
  const { data, error } = await context.client.from("favorites").insert({ user_id: context.user.id, article_id: input.articleId, article_title: input.articleTitle, article_cover_url: input.articleCoverUrl, article_type: input.articleType }).select().single();
  return { data: data ? mapFavorite(data) : null, error: error?.message };
}

export async function removeFavorite(context: AuthContext, id: string) {
  const { error } = await context.client.from("favorites").delete().eq("id", id).eq("user_id", context.user.id);
  return { error: error?.message };
}

export async function getMyNotificationSettings(context: AuthContext) {
  const { data, error } = await context.client.from("notification_settings").select("*").eq("user_id", context.user.id).maybeSingle();
  return { data: data ? mapNotification(data) : defaultNotifications(context.user.id), error: error?.message };
}

export async function saveMyNotificationSettings(context: AuthContext, input: Partial<NotificationSettings>) {
  const { data, error } = await context.client.from("notification_settings").upsert({ user_id: context.user.id, browser_permission: input.browserPermission ?? "default", follow_reminders: input.followReminders ?? true, major_match_reminders: input.majorMatchReminders ?? true, updated_at: new Date().toISOString() }).select().single();
  return { data: data ? mapNotification(data) : null, error: error?.message };
}

function mapProfile(row: Row): UserProfile { return { id: row.id, displayName: row.display_name ?? undefined, mainTeamId: row.main_team_id ?? undefined, hasCompletedOnboarding: Boolean(row.has_completed_onboarding), createdAt: row.created_at, updatedAt: row.updated_at }; }
function mapFollow(row: Row): FollowRecord { return { id: row.id, targetType: row.target_type, targetId: row.target_id, targetName: row.target_name, createdAt: row.created_at }; }
function mapFavorite(row: Row): FavoriteRecord { return { id: row.id, articleId: row.article_id, articleTitle: row.article_title, articleCoverUrl: row.article_cover_url ?? undefined, articleType: row.article_type ?? undefined, createdAt: row.created_at }; }
function mapNotification(row: Row): NotificationSettings { return { userId: row.user_id, browserPermission: row.browser_permission, followReminders: Boolean(row.follow_reminders), majorMatchReminders: Boolean(row.major_match_reminders), updatedAt: row.updated_at }; }
function defaultNotifications(userId: string): NotificationSettings { return { userId, browserPermission: "default", followReminders: true, majorMatchReminders: true, updatedAt: new Date().toISOString() }; }
