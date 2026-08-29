import { WSL_LEAGUE_ID, WSL_LEAGUE_NAME } from "@/lib/wsl-api/constants";
import { localizeCountry, localizeEventName, localizeLeagueName, localizePlayerName, localizePosition, localizeStatName, localizeTeamDescription, localizeTeamName } from "@/lib/wsl-api/localization";
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
  if (["ft", "aet", "pen", "finished", "match finished"].some((item) => value.includes(item))) return "finished";
  if (["ns", "not started", "scheduled", "tbd"].some((item) => value.includes(item))) return "scheduled";
  if (value.includes("postponed")) return "postponed";
  if (value.includes("cancelled")) return "cancelled";
  if (["live", "1h", "2h", "ht", "et"].some((item) => value.includes(item))) return "live";
  return "unknown";
}

function startsAt(raw: RawRecord) {
  const date = text(raw, "dateEvent");
  const time = text(raw, "strTime") ?? "00:00:00";
  return date ? new Date(`${date}T${time.replace("Z", "")}Z`).toISOString() : undefined;
}

export function normalizeTeam(raw: RawRecord): Team {
  const originalName = text(raw, "strTeam") ?? "暂未提供";
  return {
    id: text(raw, "idTeam") ?? "unknown-team",
    name: localizeTeamName(originalName),
    originalName,
    leagueId: text(raw, "idLeague") ?? WSL_LEAGUE_ID,
    leagueName: localizeLeagueName(text(raw, "strLeague") ?? WSL_LEAGUE_NAME),
    country: localizeCountry(text(raw, "strCountry")),
    badgeUrl: text(raw, "strBadge"),
    website: text(raw, "strWebsite"),
  };
}

export function normalizePlayer(raw: RawRecord): Player {
  const originalName = text(raw, "strPlayer") ?? "暂未提供";
  return {
    id: text(raw, "idPlayer") ?? "unknown-player",
    name: originalName,
    originalName,
    chineseName: localizePlayerName(originalName),
    position: localizePosition(text(raw, "strPosition")),
    nationality: localizeCountry(text(raw, "strNationality")),
    avatarUrl: text(raw, "strThumb") ?? text(raw, "strCutout"),
  };
}

export function normalizePlayerDetail(raw: RawRecord, stats?: RawRecord): PlayerDetail {
  return {
    ...normalizePlayer(raw),
    teamId: text(raw, "idTeam"),
    teamName: localizeTeamName(text(raw, "strTeam")),
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
  const teamId = text(raw, "idTeam");
  return {
    ...normalizeTeam(raw),
    description: localizeTeamDescription(teamId, text(raw, "strDescriptionEN")),
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
    leagueName: localizeLeagueName(text(raw, "strLeague") ?? WSL_LEAGUE_NAME),
    homeTeamId: text(raw, "idHomeTeam"),
    awayTeamId: text(raw, "idAwayTeam"),
    homeTeamName: localizeTeamName(text(raw, "strHomeTeam")),
    awayTeamName: localizeTeamName(text(raw, "strAwayTeam")),
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
    teamName: localizeTeamName(text(raw, "strTeam")),
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
  return { minute: num(raw, "intTime"), teamName: localizeTeamName(text(raw, "strTeam")), playerName: text(raw, "strPlayer"), type: localizeEventName(text(raw, "strTimeline")) };
}

function normalizeMatchStat(raw: RawRecord): MatchStat {
  return { name: localizeStatName(text(raw, "strStat")), homeValue: text(raw, "intHome"), awayValue: text(raw, "intAway") };
}

function normalizeLineupPlayer(raw: RawRecord): LineupPlayer {
  return { playerId: text(raw, "idPlayer"), playerName: text(raw, "strPlayer") ?? "暂未提供", teamName: localizeTeamName(text(raw, "strTeam")), position: localizePosition(text(raw, "strPosition")) };
}
