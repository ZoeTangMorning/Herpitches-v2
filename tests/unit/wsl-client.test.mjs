import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

async function source() {
  return readFile(path.join(root, "lib/wsl-api/client.ts"), "utf8");
}

test("WSL client uses the default absolute API URL when env URL is empty", async () => {
  const client = await source();
  assert.match(client, /value\?\.trim\(\) \|\| DEFAULT_SPORTSDB_BASE_URL/);
  assert.match(client, /new URL\(/);
});

test("WSL client preserves custom base URLs and forwards query parameters", async () => {
  const client = await source();
  assert.match(client, /buildSportsDbUrl\(/);
  assert.ok(client.includes('endpoint.replace(/^\\/+/, "")'));
  assert.match(client, /url\.searchParams\.set\(key, String\(value\)\)/);
  assert.match(client, /baseUrl = resolveSportsDbBaseUrl\(\)/);
});
