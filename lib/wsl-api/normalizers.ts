import { WSL_LEAGUE_ID, WSL_LEAGUE_NAME } from "@/lib/wsl-api/constants";
import type { Fixture, FixtureStatus, LineupPlayer, MatchDetail, MatchEvent, MatchStat, Player, PlayerDetail, StandingRow, Team, TeamDetail } from "@/types/wsl";

type RawRecord = Record<string, unknown>;

function text(raw: RawRecord, key: string) {
  const value = raw[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function num(raw: RawRecord, key: string) {
  const value = Number(raw[key]);
  return Number.isFinite(value) ? value : undefined;
}

function status(raw: RawRecord): FixtureStatus {
  const value = (text(raw, "strStatus") ?? "").toLowerCase();
  if (value.includes("match finished")) return "finished";
  if (value.includes("not started")) return "scheduled";
  if (value.includes("postponed")) return "postponed";
  if (value.includes("cancelled")) return "cancelled";
  if (value.includes("live")) return "live";
  return "unknown";
}

function startsAt(raw: RawRecord) {
  const date = text(raw, "dateEvent");
  const time = text(raw, "strTime") ?? "00:00:00";
  return date ? new Date(`${date}T${time.replace("Z", "")}Z`).toISOString() : undefined;
}

export function normalizeTeam(raw: RawRecord): Team {
  return {
    id: text(raw, "idTeam") ?? "unknown-team",
    name: text(raw, "strTeam") ?? "暂未提供",
    originalName: text(raw, "strTeam") ?? "暂未提供",
    leagueId: text(raw, "idLeague") ?? WSL_LEAGUE_ID,
    leagueName: text(raw, "strLeague") ?? WSL_LEAGUE_NAME,
    country: text(raw, "strCountry"),
    badgeUrl: text(raw, "strBadge"),
    website: text(raw, "strWebsite"),
  };
}

export function normalizePlayer(raw: RawRecord): Player {
  return {
    id: text(raw, "idPlayer") ?? "unknown-player",
    name: text(raw, "strPlayer") ?? "暂未提供",
    originalName: text(raw, "strPlayer") ?? "暂未提供",
    position: text(raw, "strPosition"),
    nationality: text(raw, "strNationality"),
    avatarUrl: text(raw, "strThumb") ?? text(raw, "strCutout"),
  };
}

export function normalizePlayerDetail(raw: RawRecord, stats?: RawRecord): PlayerDetail {
  return {
    ...normalizePlayer(raw),
    teamId: text(raw, "idTeam"),
    teamName: text(raw, "strTeam"),
    bornAt: text(raw, "dateBorn"),
    description: text(raw, "strDescriptionEN"),
    stats: stats
      ? {
          appearances: num(stats, "intAppearances"),
          starts: num(stats, "intStarts"),
          goals: num(stats, "intGoals"),
          assists: num(stats, "intAssists"),
          yellowCards: num(stats, "intYellowCards"),
          redCards: num(stats, "intRedCards"),
          minutes: num(stats, "intMinutes"),
        }
      : undefined,
  };
}

export function normalizeTeamDetail(raw: RawRecord, players: RawRecord[]): TeamDetail {
  return {
    ...normalizeTeam(raw),
    description: text(raw, "strDescriptionEN"),
    stadium: text(raw, "strStadium"),
    formedYear: text(raw, "intFormedYear"),
    players: players.map(normalizePlayer),
  };
}

export function normalizeFixture(raw: RawRecord): Fixture {
  return {
    id: text(raw, "idEvent") ?? "unknown-match",
    season: text(raw, "strSeason") ?? "",
    leagueId: text(raw, "idLeague") ?? WSL_LEAGUE_ID,
    leagueName: text(raw, "strLeague") ?? WSL_LEAGUE_NAME,
    homeTeamId: text(raw, "idHomeTeam"),
    awayTeamId: text(raw, "idAwayTeam"),
    homeTeamName: text(raw, "strHomeTeam") ?? "暂未提供",
    awayTeamName: text(raw, "strAwayTeam") ?? "暂未提供",
    startsAt: startsAt(raw),
    venue: text(raw, "strVenue"),
    status: status(raw),
    homeScore: num(raw, "intHomeScore"),
    awayScore: num(raw, "intAwayScore"),
  };
}

export function normalizeStandingRow(raw: RawRecord): StandingRow {
  return {
    rank: num(raw, "intRank") ?? 0,
    teamId: text(raw, "idTeam"),
    teamName: text(raw, "strTeam") ?? "暂未提供",
    played: num(raw, "intPlayed"),
    wins: num(raw, "intWin"),
    draws: num(raw, "intDraw"),
    losses: num(raw, "intLoss"),
    goalsFor: num(raw, "intGoalsFor"),
    goalsAgainst: num(raw, "intGoalsAgainst"),
    goalDifference: num(raw, "intGoalDifference"),
    points: num(raw, "intPoints"),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeMatchDetail(raw: RawRecord, lineups: RawRecord[], timeline: RawRecord[], stats: RawRecord[]): MatchDetail {
  return {
    ...normalizeFixture(raw),
    events: timeline.map(normalizeMatchEvent),
    stats: stats.map(normalizeMatchStat),
    lineups: lineups.map(normalizeLineupPlayer),
    tacticalSummary: undefined,
  };
}

function normalizeMatchEvent(raw: RawRecord): MatchEvent {
  return { minute: num(raw, "intTime"), teamName: text(raw, "strTeam"), playerName: text(raw, "strPlayer"), type: text(raw, "strTimeline") ?? "event" };
}

function normalizeMatchStat(raw: RawRecord): MatchStat {
  return { name: text(raw, "strStat") ?? "统计", homeValue: text(raw, "intHome"), awayValue: text(raw, "intAway") };
}

function normalizeLineupPlayer(raw: RawRecord): LineupPlayer {
  return { playerId: text(raw, "idPlayer"), playerName: text(raw, "strPlayer") ?? "暂未提供", teamName: text(raw, "strTeam"), position: text(raw, "strPosition") };
}
