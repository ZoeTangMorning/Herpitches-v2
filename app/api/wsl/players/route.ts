import { NextRequest, NextResponse } from "next/server";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";

// 球员详情必须知道 playerId；缺少参数时返回 400，避免返回错误球员。
export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("playerId");
  if (!playerId) {
    return NextResponse.json({ error: "MISSING_PLAYER_ID", message: "请传入 playerId。" }, { status: 400 });
  }
  return NextResponse.json(await getWslApiAdapter().getPlayer(playerId));
}
