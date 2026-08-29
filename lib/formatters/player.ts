import type { Player, PlayerDetail } from "@/types/wsl";

// 球员姓名可能有原文名和中文名。这里统一决定页面怎么拼接。
export function formatPlayerName(player: Player | PlayerDetail) {
  if (player.chineseName && player.chineseName !== player.originalName) {
    return `${player.originalName} / ${player.chineseName}`;
  }
  return player.name || player.originalName || "暂未提供姓名";
}

export function formatNullableText(value?: string) {
  return value?.trim() ? value : "暂未提供";
}

export function formatNumber(value?: number) {
  return typeof value === "number" ? String(value) : "未提供";
}
