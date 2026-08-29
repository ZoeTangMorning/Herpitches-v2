import { TheSportsDbClient } from "@/lib/wsl-api/client";
import { DEFAULT_SEASON, WSL_LEAGUE_ID, WSL_LEAGUE_SLUG } from "@/lib/wsl-api/constants";
import { formatWslApiError, WslApiError } from "@/lib/wsl-api/errors";
import { mockWslApiAdapter } from "@/lib/wsl-api/mock-adapter";
import { normalizeFixture, normalizeMatchDetail, normalizePlayerDetail, normalizeStandingRow, normalizeTeam, normalizeTeamDetail } from "@/lib/wsl-api/normalizers";
import type { ApiResult } from "@/types/api";
import type { Fixture, FixtureQuery, MatchDetail, PlayerDetail, StandingQuery, StandingRow, Team, TeamDetail, TeamQuery } from "@/types/wsl";

type ListResponse<T> = Record<string, T[] | null | undefined>;

const ARSENAL_WOMEN_API_TEAM_ID = "140219";

export interface WslApiAdapter {
  getFixtures(params?: FixtureQuery): Promise<ApiResult<Fixture[]>>;
  getStandings(params?: StandingQuery): Promise<ApiResult<StandingRow[]>>;
  getTeams(params?: TeamQuery): Promise<ApiResult<Team[]>>;
  getTeam(teamId: string): Promise<ApiResult<TeamDetail>>;
  getPlayer(playerId: string): Promise<ApiResult<PlayerDetail>>;
  getMatch(matchId: string): Promise<ApiResult<MatchDetail>>;
}

function liveResult<T>(data: T): ApiResult<T> {
  return { data, source: "live", updatedAt: new Date().toISOString(), isStale: false };
}

function fallbackResult<T extends ApiResult<unknown>>(result: T, error: unknown): T {
  return { ...result, error: formatWslApiError(error) };
}

function emptyResultError(subject: string) {
  return new WslApiError(`TheSportsDB 未返回${subject}，已切换到演示数据。`);
}

// 这里是 TheSportsDB 的适配层：把供应商 API 组合成项目自己的 WSL 接口。
class TheSportsDbAdapter implements WslApiAdapter {
  constructor(private readonly client = new TheSportsDbClient()) {}

  async getTeams(_params?: TeamQuery) {
    try {
      const response = await this.client.get<ListResponse<Record<string, unknown>>>("search_all_teams.php", { l: WSL_LEAGUE_SLUG });
      const teams = (response.teams ?? []).map(normalizeTeam);
      if (teams.length) {
        const mockTeams = await mockWslApiAdapter.getTeams();
        const arsenalDemo = mockTeams.data.find((team) => team.id === "mock-arsenal-women");
        const navigationTeams = teams.map((team) => team.id === ARSENAL_WOMEN_API_TEAM_ID && arsenalDemo ? arsenalDemo : team);
        return liveResult(navigationTeams);
      }
      return fallbackResult(await mockWslApiAdapter.getTeams(), emptyResultError("球队列表"));
    } catch (error) {
      return fallbackResult(await mockWslApiAdapter.getTeams(), error);
    }
  }

  async getTeam(teamId: string) {
    try {
      const teamResponse = await this.client.get<ListResponse<Record<string, unknown>>>("lookupteam.php", { id: teamId });
      const team = teamResponse.teams?.[0];
      if (!team) return fallbackResult(await mockWslApiAdapter.getTeam(teamId), emptyResultError("球队资料"));

      const playerRequest = async () => this.client.get<ListResponse<Record<string, unknown>>>("lookup_all_players.php", { id: teamId });
      let playerResponse: ListResponse<Record<string, unknown>> | null = null;
      let playerError: unknown = null;

      try {
        playerResponse = await playerRequest();
      } catch (error) {
        playerError = error;
      }

      const players = playerResponse?.player ?? [];
      if (players.length) return liveResult(normalizeTeamDetail(team, players));

      try {
        playerResponse = await playerRequest();
      } catch (error) {
        playerError = error;
      }

      const retryPlayers = playerResponse?.player ?? [];
      if (retryPlayers.length) return liveResult(normalizeTeamDetail(team, retryPlayers));
      const detail = normalizeTeamDetail(team, []);
      return { ...liveResult(detail), error: formatWslApiError(playerError ?? new WslApiError("球员信息为空。")) };
    } catch (error) {
      return fallbackResult(await mockWslApiAdapter.getTeam(teamId), error);
    }
  }

  async getPlayer(playerId: string) {
    if (playerId.startsWith("mock-")) {
      return mockWslApiAdapter.getPlayer(playerId);
    }

    try {
      const [playerResponse, statsResponse] = await Promise.all([
        this.client.get<ListResponse<Record<string, unknown>>>("lookupplayer.php", { id: playerId }),
        this.client.get<ListResponse<Record<string, unknown>>>("lookupplayerstats.php", { id: playerId }),
      ]);
      const player = playerResponse.players?.[0];
      return player ? liveResult(normalizePlayerDetail(player, statsResponse.playerstats?.[0])) : fallbackResult(await mockWslApiAdapter.getPlayer(playerId), emptyResultError("球员资料"));
    } catch (error) {
      return fallbackResult(await mockWslApiAdapter.getPlayer(playerId), error);
    }
  }

  async getFixtures(params?: FixtureQuery) {
    try {
      const season = params?.season ?? DEFAULT_SEASON;
      const response = await this.client.get<ListResponse<Record<string, unknown>>>("eventsseason.php", { id: WSL_LEAGUE_ID, s: season });
      const fixtures = (response.events ?? []).map(normalizeFixture).filter((fixture) => {
        const matchesTeam = !params?.teamId || fixture.homeTeamId === params.teamId || fixture.awayTeamId === params.teamId;
        const matchesStatus = !params?.status || fixture.status === params.status;
        return matchesTeam && matchesStatus;
      });
      return fixtures.length ? liveResult(fixtures) : fallbackResult(await mockWslApiAdapter.getFixtures({ ...params, season }), emptyResultError("赛程数据"));
    } catch (error) {
      return fallbackResult(await mockWslApiAdapter.getFixtures(params), error);
    }
  }

  async getStandings(params?: StandingQuery) {
    try {
      const season = params?.season ?? DEFAULT_SEASON;
      const response = await this.client.get<ListResponse<Record<string, unknown>>>("lookuptable.php", { l: WSL_LEAGUE_ID, s: season });
      const rows = (response.table ?? []).map(normalizeStandingRow);
      return rows.length ? liveResult(rows) : fallbackResult(await mockWslApiAdapter.getStandings(params), emptyResultError("积分榜"));
    } catch (error) {
      return fallbackResult(await mockWslApiAdapter.getStandings(params), error);
    }
  }

  async getMatch(matchId: string) {
    try {
      const [eventResponse, lineupResponse, timelineResponse, statsResponse] = await Promise.all([
        this.client.get<ListResponse<Record<string, unknown>>>("lookupevent.php", { id: matchId }),
        this.client.get<ListResponse<Record<string, unknown>>>("lookuplineup.php", { id: matchId }),
        this.client.get<ListResponse<Record<string, unknown>>>("lookuptimeline.php", { id: matchId }),
        this.client.get<ListResponse<Record<string, unknown>>>("lookupeventstats.php", { id: matchId }),
      ]);
      const event = eventResponse.events?.[0];
      return event ? liveResult(normalizeMatchDetail(event, lineupResponse.lineup ?? [], timelineResponse.timeline ?? [], statsResponse.eventstats ?? [])) : fallbackResult(await mockWslApiAdapter.getMatch(matchId), emptyResultError("比赛详情"));
    } catch (error) {
      return fallbackResult(await mockWslApiAdapter.getMatch(matchId), error);
    }
  }
}

export function getWslApiAdapter(): WslApiAdapter {
  return new TheSportsDbAdapter();
}
