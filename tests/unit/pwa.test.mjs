import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("PWA manifest and shell stay mobile-first", async () => {
  const manifest = await source("app/manifest.ts");
  const shell = await source("components/layout/mobile-shell.ts");
  const layout = await source("app/layout.tsx");

  assert.match(manifest, /display: "standalone"/);
  assert.match(manifest, /start_url: "\/news"/);
  assert.match(shell, /max-w-\[480px\]/);
  assert.match(shell, /px-4/);
  assert.match(layout, /PwaClient/);
});

test("Service worker caches public pages and offline fallback", async () => {
  const sw = await source("public/sw.js");

  assert.match(sw, /const PAGE_CACHE = `\$\{VERSION\}-pages`/);
  assert.match(sw, /caches\.match\("\/offline"\)/);
  assert.match(sw, /networkFirstPage/);
  assert.match(sw, /request\.destination === "image"/);
});
