import { NextRequest, NextResponse } from "next/server";
import { getWslApiAdapter } from "@/lib/wsl-api/adapter";

// 不传 teamId 时返回球队列表；传 teamId 时返回球队详情，保持一个内部入口。
export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get("teamId");
  const adapter = getWslApiAdapter();
  const result = teamId ? await adapter.getTeam(teamId) : await adapter.getTeams();
  return NextResponse.json(result);
}
