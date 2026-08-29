import { DEFAULT_SEASON, WSL_LEAGUE_ID, WSL_LEAGUE_NAME } from "@/lib/wsl-api/constants";
import type { ApiResult } from "@/types/api";
import type { Fixture, FixtureQuery, MatchDetail, PlayerDetail, StandingQuery, StandingRow, Team, TeamDetail, TeamQuery } from "@/types/wsl";

const updatedAt = new Date("2026-08-27T00:00:00.000Z").toISOString();

const teams: Team[] = [
  { id: "mock-arsenal-women", name: "Arsenal Women", originalName: "Arsenal Women", leagueId: WSL_LEAGUE_ID, leagueName: WSL_LEAGUE_NAME },
  { id: "mock-chelsea-women", name: "Chelsea Women", originalName: "Chelsea Women", leagueId: WSL_LEAGUE_ID, leagueName: WSL_LEAGUE_NAME },
];

const fixtures: Fixture[] = [
  {
    id: "mock-match-1",
    season: DEFAULT_SEASON,
    leagueId: WSL_LEAGUE_ID,
    leagueName: WSL_LEAGUE_NAME,
    homeTeamId: teams[0].id,
    awayTeamId: teams[1].id,
    homeTeamName: teams[0].name,
    awayTeamName: teams[1].name,
    startsAt: "2025-09-07T13:00:00.000Z",
    status: "scheduled",
  },
];

function result<T>(data: T, isStale = true): ApiResult<T> {
  return { data, source: "mock", updatedAt, isStale };
}

// mock adapter 是演示兜底层：真实 API 临时不可用时，页面仍能拿到内部类型。
export const mockWslApiAdapter = {
  async getTeams(_params?: TeamQuery) {
    return result(teams);
  },
  async getTeam(teamId: string): Promise<ApiResult<TeamDetail>> {
    const team = teams.find((item) => item.id === teamId) ?? teams[0];
    return result({ ...team, description: "TheSportsDB 不可用时显示的演示球队。", players: [mockPlayer] });
  },
  async getPlayer(_playerId: string): Promise<ApiResult<PlayerDetail>> {
    return result(mockPlayer);
  },
  async getFixtures(params?: FixtureQuery) {
    const season = params?.season ?? DEFAULT_SEASON;
    const filtered = fixtures
      .map((fixture) => ({ ...fixture, season }))
      .filter((fixture) => {
        const matchesTeam = !params?.teamId || fixture.homeTeamId === params.teamId || fixture.awayTeamId === params.teamId;
        const matchesStatus = !params?.status || fixture.status === params.status;
        return matchesTeam && matchesStatus;
      });
    return result(filtered.length ? filtered : fixtures.map((fixture) => ({ ...fixture, season })));
  },
  async getStandings(_params?: StandingQuery): Promise<ApiResult<StandingRow[]>> {
    return result([
      { rank: 1, teamId: teams[1].id, teamName: teams[1].name, played: 0, points: 0, updatedAt },
      { rank: 2, teamId: teams[0].id, teamName: teams[0].name, played: 0, points: 0, updatedAt },
    ]);
  },
  async getMatch(matchId: string): Promise<ApiResult<MatchDetail>> {
    const fixture = fixtures.find((item) => item.id === matchId) ?? fixtures[0];
    return result({ ...fixture, events: [], stats: [], lineups: [], tacticalSummary: "暂未提供" });
  },
};

const mockPlayer: PlayerDetail = {
  id: "mock-player-1",
  name: "Demo Player",
  originalName: "Demo Player",
  position: "Forward",
  teamId: teams[0].id,
  teamName: teams[0].name,
  stats: { appearances: 0 },
};
