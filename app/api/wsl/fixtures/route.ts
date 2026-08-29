import { NextRequest, NextResponse } from "next/server";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";
import type { FixtureStatus } from "@/types/wsl";

const allowedStatuses: FixtureStatus[] = ["scheduled", "live", "finished", "postponed", "cancelled", "unknown"];

// Route Handler 是前端页面访问数据的稳定入口，不把 TheSportsDB 地址暴露出去。
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const result = await getWslApiAdapter().getFixtures({
    season: params.get("season") ?? undefined,
    teamId: params.get("teamId") ?? undefined,
    status: allowedStatuses.find((item) => item === status),
  });
  return NextResponse.json(result);
}
