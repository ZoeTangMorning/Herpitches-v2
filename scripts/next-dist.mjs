import { spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
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

// dev 模式下清掉旧的 distDir，避免半成品产物缺失 pages/_document.js 之类的运行时文件。
if (command === "dev" && existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}

const child = spawn(process.execPath, [nextBin, command, ...args], {
  env: { ...process.env, NEXT_DIST_DIR: distDir },
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
