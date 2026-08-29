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
});
