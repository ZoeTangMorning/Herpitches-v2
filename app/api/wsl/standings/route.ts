import { NextRequest, NextResponse } from "next/server";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";

// 积分榜默认使用 adapter 里的默认赛季，也允许页面显式传入 season。
export async function GET(request: NextRequest) {
  const result = await getWslApiAdapter().getStandings({
    season: request.nextUrl.searchParams.get("season") ?? undefined,
  });
  return NextResponse.json(result);
}
