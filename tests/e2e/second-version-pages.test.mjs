import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("data center defaults to the fixtures panel and switches in place", async () => {
  const dataPage = await source("app/(main)/data/page.tsx");
  const switcher = await source("components/data/data-center-switcher.tsx");
  const globals = await source("app/globals.css");

  assert.match(dataPage, /<DataCenterSwitcher fixtures=\{fixtures\} standings=\{standings\} teams=\{teams\}/);
  assert.doesNotMatch(dataPage, /redirect\("\/data\/fixtures"\)/);
  assert.match(switcher, /useState<DataCenterTab>\("fixtures"\)/);
  assert.match(switcher, /label: "赛程"/);
  assert.match(switcher, /label: "积分榜"/);
  assert.match(switcher, /label: "球队"/);
  assert.match(switcher, /aria-pressed=\{active\}/);
  assert.match(switcher, /divide-x/);
  assert.match(switcher, /#8a4ca5/);
  assert.match(switcher, /data-panel-enter/);
  assert.match(globals, /@keyframes data-panel-enter/);
});

test("global header owns the single top-left back button", async () => {
  const siteHeader = await source("components/layout/site-header.tsx");
  const mainLayout = await source("app/(main)/layout.tsx");
  const backButton = await source("components/layout/back-button.tsx");

  assert.match(siteHeader, /<BackButton \/>/);
  assert.doesNotMatch(mainLayout, /BackButton/);
  assert.match(backButton, /router\.back\(\)/);
  assert.match(backButton, /&lt;/);
});

test("main-team pages show related news without the old detail entry", async () => {
  const clubPage = await source("app/(main)/club/page.tsx");
  const teamPage = await source("app/(main)/data/teams/[teamId]/page.tsx");
  const articleCard = await source("components/news/article-card.tsx");

  assert.match(clubPage, /getMockArticles\(\{ teamId: profile\.data\.mainTeamId \}\)/);
  assert.match(clubPage, /主队相关新闻/);
  assert.doesNotMatch(clubPage, /查看球队详情/);
  assert.match(teamPage, /commentsHref=\{`\/news\/\$\{article\.id\}#comments`\}/);
  assert.match(articleCard, /commentsHref = "#comments"/);
});

test("recent fixtures render square team badges from the teamId image folder", async () => {
  const fixtureCard = await source("components/data/fixture-card.tsx");
  const teamBadge = await source("components/data/team-badge.tsx");
  const badgeDir = path.join(root, "public", "images", "team-badges", ".gitkeep");

  assert.match(fixtureCard, /TeamBadge/);
  assert.match(fixtureCard, /\/images\/team-badges\/\$\{id\}\.png/);
  assert.match(fixtureCard, /className="h-12 w-12"/);
  assert.match(teamBadge, /role="img"/);
  assert.match(teamBadge, /opacity-0/);
  assert.ok(existsSync(badgeDir));
  for (const teamId of ["140218", "140219", "140220", "140221", "140222", "140224", "140225", "140226", "140228", "140229", "140399", "140532", "140537", "140539", "140540"]) {
    assert.ok(existsSync(path.join(root, "public", "images", "team-badges", `${teamId}.png`)));
  }
});

test("Arsenal Women demo roster links to three complete player profiles", async () => {
  const adapter = await source("lib/wsl-api/adapter.ts");
  const manualArsenal = await source("lib/wsl-api/manual-arsenal.ts");
  const mockAdapter = await source("lib/wsl-api/mock-adapter.ts");
  const playerPage = await source("app/(main)/data/players/[playerId]/page.tsx");
  const playerAvatar = await source("components/data/player-avatar.tsx");
  const playerDir = path.join(root, "public", "images", "players");

  for (const playerId of ["mock-arsenal-russo", "mock-arsenal-williamson", "mock-arsenal-caldentey"]) {
    assert.match(mockAdapter, new RegExp(`id: "${playerId}"`));
  }
  assert.match(adapter, /teamId === MANUAL_ARSENAL_TEAM_ID/);
  assert.match(adapter, /params\?\.teamId === MANUAL_ARSENAL_TEAM_ID/);
  assert.match(adapter, /MANUAL_ARSENAL_PLAYER_IDS\.has\(playerId\)/);
  assert.match(manualArsenal, /MANUAL_ARSENAL_TEAM_ID = "140219"/);
  assert.match(manualArsenal, /source: "manual"/);
  assert.match(manualArsenal, /teamId: MANUAL_ARSENAL_TEAM_ID/);
  assert.match(mockAdapter, /marketValue: "€735k"/);
  assert.match(mockAdapter, /marketValue: "€800k"/);
  assert.match(mockAdapter, /marketValue: "€1,100k"/);
  assert.match(mockAdapter, /stats: \{ appearances: 28, starts: 22, goals: 13, assists: 6 \}/);
  assert.match(mockAdapter, /stats: \{ appearances: 6, starts: 2, goals: 1, assists: 0 \}/);
  assert.match(mockAdapter, /stats: \{ appearances: 22, starts: 20, goals: 4, assists: 4 \}/);
  assert.match(mockAdapter, /英格兰前锋阿莱西娅在2024\/25赛季/);
  assert.match(mockAdapter, /这名身材高挑、气质优雅的后卫/);
  assert.match(mockAdapter, /西班牙国脚中场马里奥娜·卡尔登泰/);

  for (const section of ["转会记录", "近期比赛", "球员简介", "赛季基础数据"]) {
    assert.match(playerPage, new RegExp(section));
  }
  assert.match(playerPage, /<PlayerAvatar/);
  assert.match(playerPage, /<TeamBadge/);
  assert.match(playerPage, /aria-label="英格兰旗"/);
  assert.match(playerPage, /fill="#CE1124"/);
  assert.match(playerPage, /src="\/images\/flags\/spain\.svg"/);
  assert.match(playerPage, /alt="西班牙旗"/);
  assert.match(playerPage, /whitespace-pre-line/);
  assert.doesNotMatch(playerPage, /FollowButton|DataSourceNote|stats\.minutes/);
  assert.match(playerAvatar, /onError=\{\(\) => setBroken\(true\)\}/);

  for (const image of ["alessia-russo.webp", "leah-williamson.webp", "mariona-caldentey.webp"]) {
    assert.ok(existsSync(path.join(playerDir, image)));
  }
  assert.ok(existsSync(path.join(root, "public", "images", "flags", "spain.svg")));
});

test("Arsenal detail data is manual while other teams remain API-backed", async () => {
  const adapter = await source("lib/wsl-api/adapter.ts");
  const apiTypes = await source("types/api.ts");
  const dataState = await source("components/data/data-state.tsx");

  assert.match(apiTypes, /ApiSource = "live" \| "cache" \| "mock" \| "manual"/);
  assert.match(dataState, /result\.source === "manual"/);
  assert.match(adapter, /if \(teamId === MANUAL_ARSENAL_TEAM_ID\) return getManualArsenalTeam\(\)/);
  assert.match(adapter, /if \(params\?\.teamId === MANUAL_ARSENAL_TEAM_ID\) return getManualArsenalFixtures\(params\)/);
  assert.match(adapter, /if \(MANUAL_ARSENAL_PLAYER_IDS\.has\(playerId\)\) return getManualArsenalPlayer\(playerId\)!/);
});

test("live WSL API values are localized before reaching the UI", async () => {
  const localization = await source("lib/wsl-api/localization.ts");
  const normalizers = await source("lib/wsl-api/normalizers.ts");

  for (const text of ["阿斯顿维拉女足", "布莱顿女足", "切尔西女足", "曼城女足", "曼联女足", "托特纳姆热刺女足", "英格兰女足超级联赛", "中后卫", "控球率"]) {
    assert.match(localization, new RegExp(text));
  }
  for (const helper of ["localizeTeamName", "localizeCountry", "localizeLeagueName", "localizePosition", "localizeEventName", "localizeStatName"]) {
    assert.match(normalizers, new RegExp(helper));
  }
});

test("live WSL fixture statuses recognize TheSportsDB short status values", async () => {
  const normalizers = await source("lib/wsl-api/normalizers.ts");
  assert.match(normalizers, /\["ft", "aet", "pen", "finished", "match finished"\]/);
  assert.match(normalizers, /\["ns", "not started", "scheduled", "tbd"\]/);
  assert.match(normalizers, /\["live", "1h", "2h", "ht", "et"\]/);
});
