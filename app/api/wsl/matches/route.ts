import { NextRequest, NextResponse } from "next/server";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";

// 比赛详情必须知道 matchId；缺少参数时返回 400，方便调用方尽早发现问题。
export async function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get("matchId");
  if (!matchId) {
    return NextResponse.json({ error: "MISSING_MATCH_ID", message: "请传入 matchId。" }, { status: 400 });
  }
  return NextResponse.json(await getWslApiAdapter().getMatch(matchId));
}
