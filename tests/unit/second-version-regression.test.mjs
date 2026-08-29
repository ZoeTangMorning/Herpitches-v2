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

test("community demo state keeps herpitches as the default and persists locally", async () => {
  const storage = await source("components/community/community-storage.ts");
  const board = await source("components/community/community-board.tsx");

  assert.match(storage, /COMMUNITY_STORAGE_KEY = "herpitches\.community\.demo\.v1"/);
  assert.match(storage, /id: "herpitches"/);
  assert.match(storage, /window\.localStorage\.getItem/);
  assert.match(storage, /window\.localStorage\.setItem/);
  assert.match(storage, /function normalizeCommunities/);
  assert.match(board, /activeCommunityId: HERPITCHES_COMMUNITY\.id/);
  assert.match(board, /writeCommunityState\(state\)/);
  assert.match(board, /onTouchStart/);
  assert.match(board, /delta > 60/);
});

test("following a team or player creates a matching demo community", async () => {
  const followButton = await source("components/user/follow-button.tsx");
  const clubSelector = await source("components/user/club-selector.tsx");

  assert.match(followButton, /createCommunityFromFollow/);
  assert.match(followButton, /targetType === "team" \|\| targetType === "player"/);
  assert.match(followButton, /writeCommunityState\(next\)/);
  assert.match(followButton, /new CustomEvent\("herpitches-follow"/);
  assert.match(clubSelector, /createCommunityFromFollow/);
  assert.match(clubSelector, /targetType: "team"/);
});
