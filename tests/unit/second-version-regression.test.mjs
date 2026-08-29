import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("WSL adapter retries missing team players and exposes the failure reason", async () => {
  const apiTypes = await source("types/api.ts");
  const adapter = await source("lib/wsl-api/adapter.ts");
  const errors = await source("lib/wsl-api/errors.ts");

  assert.match(apiTypes, /error\?: string/);
  assert.match(adapter, /const playerRequest = async/);
  assert.ok((adapter.match(/await playerRequest\(\)/g) ?? []).length >= 2);
  assert.match(adapter, /球员信息为空/);
  assert.match(adapter, /fallbackResult\(await mockWslApiAdapter\.getTeam\(teamId\)/);
  assert.match(errors, /formatWslApiError/);
});

test("community uses server-backed posts and keeps herpitches as the default", async () => {
  const communityPage = await source("app/(main)/community/page.tsx");
  const board = await source("components/community/community-board.tsx");
  const postsApi = await source("app/api/community/posts/route.ts");
  const migration = await source("supabase/migrations/007_community_posts.sql");

  assert.match(communityPage, /getCommunityPosts\(context, HERPITCHES_COMMUNITY\.id\)/);
  assert.match(board, /fetchWithTimeout\(`\/api\/community\/posts\?communityId=/);
  assert.match(board, /targetType="post"/);
  assert.match(postsApi, /export async function POST/);
  assert.match(migration, /create table if not exists public\.community_posts/);
  assert.match(migration, /status text not null default 'approved'/);
  assert.doesNotMatch(board, /localStorage/);
  assert.match(board, /useState\(HERPITCHES_COMMUNITY\.id\)/);
  assert.match(board, /onTouchStart/);
  assert.match(board, /delta > 60/);
});

test("community post submission uses fast local session lookup before writing", async () => {
  const board = await source("components/community/community-board.tsx");
  const queries = await source("lib/supabase/queries.ts");
  const postsApi = await source("app/api/community/posts/route.ts");

  assert.match(board, /AbortController/);
  assert.match(board, /发布超时，请稍后重试。/);
  assert.match(board, /帖子至少需要 2 个字。/);
  assert.match(board, /帖子不能超过 500 个字。/);
  assert.match(board, /maxLength={MAX_POST_LENGTH}/);
  assert.match(postsApi, /Promise\.race/);
  assert.match(postsApi, /TIMEOUT/);
  assert.match(postsApi, /getFastAuthContext\(\)/);
  assert.doesNotMatch(postsApi, /getAuthContext\(\)/);
  assert.match(queries, /readSupabaseSession/);
  assert.match(queries, /sessionUserFromSession/);
});

test("following a team or player exposes a matching server-backed community", async () => {
  const followButton = await source("components/user/follow-button.tsx");
  const clubSelector = await source("components/user/club-selector.tsx");
  const communityPage = await source("app/(main)/community/page.tsx");

  assert.doesNotMatch(followButton, /localStorage|writeCommunityState|herpitches-follow/);
  assert.doesNotMatch(clubSelector, /localStorage|writeCommunityState/);
  assert.match(communityPage, /getMyFollows/);
  assert.match(communityPage, /createCommunityFromFollow/);
});

test("community posts support post likes and personal history", async () => {
  const types = await source("types/community.ts");
  const validation = await source("lib/validation/interaction-schema.ts");
  const postValidation = await source("lib/validation/post-schema.ts");
  const mePage = await source("app/(main)/me/page.tsx");
  const myPostsPage = await source("app/(main)/me/posts/page.tsx");

  assert.match(types, /LikeTargetType = "article" \| "comment" \| "post"/);
  assert.match(validation, /\["article", "comment", "post"\]/);
  assert.match(postValidation, /content\.length < 2/);
  assert.match(postValidation, /content\.length > maxLength/);
  assert.match(mePage, /href="\/me\/posts" label="我的帖子"/);
  assert.match(myPostsPage, /getMyCommunityPosts/);
});

test("supabase auth lookups short-circuit before remote user checks", async () => {
  const queries = await source("lib/supabase/queries.ts");
  const communityContext = await source("lib/supabase/community-context.ts");
  const middleware = await source("lib/supabase/middleware.ts");
  const rootMiddleware = await source("middleware.ts");
  const bottomNavigation = await source("components/layout/bottom-navigation.tsx");

  assert.match(queries, /hasSupabaseSessionCookie/);
  assert.match(queries, /if \(!hasSupabaseSessionCookie\(cookieStore\)\) return null;/);
  assert.match(communityContext, /if \(!hasSupabaseSessionCookie\(cookieStore\)\)/);
  assert.match(middleware, /if \(!hasSupabaseSessionCookie\(request\.cookies\)\)/);
  assert.match(rootMiddleware, /matcher: \["\/auth\/callback"\]/);
  assert.match(bottomNavigation, /document\.cookie/);
});
