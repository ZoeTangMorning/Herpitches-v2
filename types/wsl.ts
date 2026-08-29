export type FixtureStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled" | "unknown";

export type FixtureQuery = {
  season?: string;
  teamId?: string;
  status?: FixtureStatus;
};

export type StandingQuery = {
  season?: string;
};

export type TeamQuery = {
  season?: string;
};

export type Team = {
  id: string;
  name: string;
  originalName: string;
  chineseName?: string;
  leagueId: string;
  leagueName: string;
  country?: string;
  badgeUrl?: string;
  website?: string;
};

export type Player = {
  id: string;
  name: string;
  originalName: string;
  chineseName?: string;
  position?: string;
  nationality?: string;
  avatarUrl?: string;
};

export type PlayerStats = {
  appearances?: number;
  starts?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  minutes?: number;
};

export type PlayerTransfer = {
  clubName: string;
  from: string;
  to: string;
};

export type PlayerFixture = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  leagueName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamBadgeUrl?: string;
  awayTeamBadgeUrl?: string;
};

export type PlayerDetail = Player & {
  teamId?: string;
  teamName?: string;
  shirtNumber?: number;
  marketValue?: string;
  bornAt?: string;
  description?: string;
  transfers?: PlayerTransfer[];
  recentFixtures?: PlayerFixture[];
  statsSeason?: string;
  stats?: PlayerStats;
};

export type Fixture = {
  id: string;
  season: string;
  leagueId: string;
  leagueName: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeamName: string;
  awayTeamName: string;
  startsAt?: string;
  venue?: string;
  status: FixtureStatus;
  homeScore?: number;
  awayScore?: number;
};

export type StandingRow = {
  rank: number;
  teamId?: string;
  teamName: string;
  played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
  updatedAt: string;
};

export type TeamDetail = Team & {
  description?: string;
  stadium?: string;
  formedYear?: string;
  players: Player[];
};

export type MatchEvent = {
  minute?: number;
  teamName?: string;
  playerName?: string;
  type: string;
};

export type MatchStat = {
  name: string;
  homeValue?: string;
  awayValue?: string;
};

export type LineupPlayer = {
  playerId?: string;
  playerName: string;
  teamName?: string;
  position?: string;
};

export type MatchDetail = Fixture & {
  events: MatchEvent[];
  stats: MatchStat[];
  lineups: LineupPlayer[];
  tacticalSummary?: string;
};
