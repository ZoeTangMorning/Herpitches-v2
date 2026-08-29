import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const [, , command, distDir, ...args] = process.argv;

if (!command || !distDir) {
  console.error("Usage: node scripts/next-dist.mjs <dev|build|start> <distDir> [...nextArgs]");
  process.exit(1);
}

const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

if (!existsSync(nextBin)) {
  console.error("Next.js binary was not found. Run npm install before starting the app.");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, command, ...args], {
  env: { ...process.env, NEXT_DIST_DIR: distDir },
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
