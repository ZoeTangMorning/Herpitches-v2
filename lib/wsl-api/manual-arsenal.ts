import { arsenalPlayers } from "@/lib/wsl-api/mock-adapter";
import { DEFAULT_SEASON, WSL_LEAGUE_ID } from "@/lib/wsl-api/constants";
import type { ApiResult } from "@/types/api";
import type { Fixture, FixtureQuery, PlayerDetail, TeamDetail } from "@/types/wsl";

export const MANUAL_ARSENAL_TEAM_ID = "140219";
export const MANUAL_ARSENAL_PLAYER_IDS = new Set([
  "mock-arsenal-russo",
  "mock-arsenal-williamson",
  "mock-arsenal-caldentey",
]);

const updatedAt = new Date("2026-08-29T00:00:00.000Z").toISOString();

const manualPlayers: PlayerDetail[] = arsenalPlayers.map((player) => ({
  ...player,
  teamId: MANUAL_ARSENAL_TEAM_ID,
  teamName: "阿森纳女足",
}));

const manualFixtures: Fixture[] = [
  {
    id: "manual-arsenal-fixture-brighton",
    season: DEFAULT_SEASON,
    leagueId: WSL_LEAGUE_ID,
    leagueName: "英格兰女足超级联赛",
    homeTeamId: "140222",
    awayTeamId: MANUAL_ARSENAL_TEAM_ID,
    homeTeamName: "布莱顿女足",
    awayTeamName: "阿森纳女足",
    startsAt: "2026-09-06T11:00:00.000Z",
    status: "scheduled",
  },
  {
    id: "manual-arsenal-fixture-palace",
    season: DEFAULT_SEASON,
    leagueId: WSL_LEAGUE_ID,
    leagueName: "英格兰女足超级联赛",
    homeTeamId: MANUAL_ARSENAL_TEAM_ID,
    awayTeamId: "140537",
    homeTeamName: "阿森纳女足",
    awayTeamName: "水晶宫女足",
    startsAt: "2026-09-17T13:45:00.000Z",
    status: "scheduled",
  },
  {
    id: "manual-arsenal-fixture-united",
    season: DEFAULT_SEASON,
    leagueId: WSL_LEAGUE_ID,
    leagueName: "英格兰女足超级联赛",
    homeTeamId: MANUAL_ARSENAL_TEAM_ID,
    awayTeamId: "140226",
    homeTeamName: "阿森纳女足",
    awayTeamName: "曼联女足",
    startsAt: "2026-09-20T00:30:00.000Z",
    status: "scheduled",
  },
];

const manualTeam: TeamDetail = {
  id: MANUAL_ARSENAL_TEAM_ID,
  name: "阿森纳女足",
  originalName: "Arsenal WFC",
  leagueId: WSL_LEAGUE_ID,
  leagueName: "英格兰女足超级联赛",
  country: "英格兰",
  badgeUrl: "/images/team-badges/140219.png",
  description: "阿森纳女足是阿森纳足球俱乐部旗下的职业女子足球队，拥有悠久历史，并长期参加英格兰最高级别女子足球赛事。",
  stadium: "Emirates Stadium",
  formedYear: "1987",
  players: manualPlayers,
};

export function getManualArsenalTeam(): ApiResult<TeamDetail> {
  return { data: manualTeam, source: "manual", updatedAt, isStale: false };
}

export function getManualArsenalFixtures(params?: FixtureQuery): ApiResult<Fixture[]> {
  const season = params?.season ?? DEFAULT_SEASON;
  const data = manualFixtures
    .map((fixture) => ({ ...fixture, season }))
    .filter((fixture) => {
      const matchesTeam = !params?.teamId || fixture.homeTeamId === params.teamId || fixture.awayTeamId === params.teamId;
      const matchesStatus = !params?.status || fixture.status === params.status;
      return matchesTeam && matchesStatus;
    });
  return { data, source: "manual", updatedAt, isStale: false };
}

export function getManualArsenalPlayer(playerId: string): ApiResult<PlayerDetail> | null {
  const player = manualPlayers.find((item) => item.id === playerId);
  return player ? { data: player, source: "manual", updatedAt, isStale: false } : null;
}
