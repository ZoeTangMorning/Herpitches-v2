import { DEFAULT_SEASON, WSL_LEAGUE_ID } from "@/lib/wsl-api/constants";
import type { ApiResult } from "@/types/api";
import type { Fixture, FixtureQuery, MatchDetail, PlayerDetail, StandingQuery, StandingRow, Team, TeamDetail, TeamQuery } from "@/types/wsl";

const updatedAt = new Date("2026-08-27T00:00:00.000Z").toISOString();

const teams: Team[] = [
  { id: "mock-arsenal-women", name: "阿森纳女足", originalName: "Arsenal Women", leagueId: WSL_LEAGUE_ID, leagueName: "英格兰女足超级联赛", country: "英格兰", badgeUrl: "/images/team-badges/arsenal.webp" },
  { id: "mock-chelsea-women", name: "Chelsea Women", originalName: "Chelsea Women", leagueId: WSL_LEAGUE_ID, leagueName: "英格兰女足超级联赛", country: "英格兰" },
];

const recentPlayerFixtures = [
  {
    id: "mock-player-fixture-brighton-arsenal",
    dateLabel: "9月6日",
    timeLabel: "19:00",
    leagueName: "英格兰女足超级联赛",
    homeTeamName: "布莱顿",
    awayTeamName: "阿森纳",
    homeTeamBadgeUrl: "/images/team-badges/brighton.png",
    awayTeamBadgeUrl: "/images/team-badges/arsenal.webp",
  },
  {
    id: "mock-player-fixture-arsenal-palace",
    dateLabel: "9月17日",
    timeLabel: "21:45",
    leagueName: "英格兰女足超级联赛",
    homeTeamName: "阿森纳",
    awayTeamName: "水晶宫",
    homeTeamBadgeUrl: "/images/team-badges/arsenal.webp",
    awayTeamBadgeUrl: "/images/team-badges/crystal-palace.png",
  },
  {
    id: "mock-player-fixture-arsenal-united",
    dateLabel: "9月20日",
    timeLabel: "00:30",
    leagueName: "英格兰女足超级联赛",
    homeTeamName: "阿森纳",
    awayTeamName: "曼联",
    homeTeamBadgeUrl: "/images/team-badges/arsenal.webp",
    awayTeamBadgeUrl: "/images/team-badges/manchester-united.png",
  },
];

export const arsenalPlayers: PlayerDetail[] = [
  {
    id: "mock-arsenal-russo",
    name: "Alessia Russo",
    originalName: "Alessia Russo",
    chineseName: "阿莱西娅·鲁索",
    position: "前锋",
    nationality: "英格兰",
    avatarUrl: "/images/players/alessia-russo.webp",
    teamId: teams[0].id,
    teamName: "阿森纳",
    shirtNumber: 23,
    marketValue: "€735k",
    bornAt: "1999.02.08",
    description: `英格兰前锋阿莱西娅在2024/25赛季进一步巩固了自己备受瞩目的声誉。她在各项赛事中攻入20球，成为俱乐部队内最佳射手；同时，她还以12粒进球与曼城前锋邦妮·肖（Bunny Shaw）并列获得女足英超金靴奖。

她在欧足联女子冠军联赛中打进8球，与马里奥娜·卡尔登泰（Mariona Caldentey）并列射手榜第二，仅次于巴塞罗那前锋克劳迪娅·皮娜（Claudia Pina）的10球。其中，她在对阵拜仁慕尼黑的3比2胜利、主场3比0击败皇家马德里的比赛中梅开二度，以及客场4比1战胜里昂的比赛中，都攻入了至关重要的进球。

这名技术出色、速度极快的前锋于2023年7月加盟枪手，并在处子赛季打进16球，帮助球队夺得联赛杯。阿莱西娅是一名极具智慧的球员，擅长回撤接应、串联进攻；上赛季，她还曾担任10号位前腰，偶尔客串左边锋。她在与曼彻斯特联的合同到期后加盟阿森纳，此前曾代表曼联出场59次，攻入27球。`,
    transfers: [
      { clubName: "曼联", from: "2020", to: "2023" },
      { clubName: "阿森纳", from: "2023", to: "至今" },
    ],
    recentFixtures: recentPlayerFixtures,
    statsSeason: "2025/26",
    stats: { appearances: 28, starts: 22, goals: 13, assists: 6 },
  },
  {
    id: "mock-arsenal-williamson",
    name: "Leah Williamson",
    originalName: "Leah Williamson",
    chineseName: "莉娅·威廉森",
    position: "中后卫",
    nationality: "英格兰",
    avatarUrl: "/images/players/leah-williamson.webp",
    teamId: teams[0].id,
    teamName: "阿森纳",
    shirtNumber: 6,
    marketValue: "€800k",
    bornAt: "1997.03.29",
    description: `这名身材高挑、气质优雅的后卫以擅长送出撕裂防线的传球，以及掌控本方禁区而闻名。她曾率领英格兰夺得2022年欧洲杯冠军，并随阿森纳捧起联赛杯，随后却遭遇了职业生涯最严重的伤病挫折。2024年1月，她及时复出，并在同年3月再次帮助球队赢得联赛杯。

这名技术出众的中后卫也曾在俱乐部和国家队出任中场。她8岁时便加入阿森纳，并早在2014年就完成了一线队首秀，至今已随俱乐部赢得8座重要赛事冠军。莉亚·威廉森（Leah Williamson）于2018年完成英格兰队首秀，并在2021年接替斯蒂芬·霍顿（Steph Houghton）出任队长`,
    transfers: [{ clubName: "阿森纳", from: "2014", to: "至今" }],
    recentFixtures: recentPlayerFixtures,
    statsSeason: "2025/26",
    stats: { appearances: 6, starts: 2, goals: 1, assists: 0 },
  },
  {
    id: "mock-arsenal-caldentey",
    name: "Mariona Caldentey",
    originalName: "Mariona Caldentey",
    chineseName: "玛丽奥娜·卡尔登泰",
    position: "中场",
    nationality: "西班牙",
    avatarUrl: "/images/players/mariona-caldentey.webp",
    teamId: teams[0].id,
    teamName: "阿森纳",
    shirtNumber: 8,
    marketValue: "€1,100k",
    bornAt: "1996.03.19",
    description: `西班牙国脚中场马里奥娜·卡尔登泰（Mariona Caldentey）在英格兰度过了极其出色的首个赛季，荣膺女足英超赛季最佳球员，并在五年内第四次捧起欧足联女子冠军联赛奖杯。此前，她曾随老东家巴塞罗那三度夺得这一荣誉。

她代表球队出场41次，攻入19球，其中包括女足英超9球（另有5次助攻）以及欧战8球。她在半决赛次回合客场4比1战胜里昂时打进的进球，还帮助她获得了欧冠赛季最佳进球奖。值得一提的是，尽管她在赛季最后两个月被安排在更深的位置担任中场，她依然取得了这样的进球数据。在这一位置上，她与金·利特尔（Kim Little）逐渐培养出默契的搭档关系，而她不知疲倦的跑动、逼抢和抢断，也和她的传球与创造力一样不可或缺。`,
    transfers: [
      { clubName: "巴塞罗那", from: "2014", to: "2024" },
      { clubName: "阿森纳", from: "2024", to: "至今" },
    ],
    recentFixtures: recentPlayerFixtures,
    statsSeason: "2025/26",
    stats: { appearances: 22, starts: 20, goals: 4, assists: 4 },
  },
];

const legacyMockPlayer: PlayerDetail = {
  id: "mock-player-1",
  name: "Demo Player",
  originalName: "Demo Player",
  position: "Forward",
  teamId: teams[0].id,
  teamName: teams[0].name,
  stats: { appearances: 0 },
};

const fixtures: Fixture[] = [
  {
    id: "mock-match-1",
    season: DEFAULT_SEASON,
    leagueId: WSL_LEAGUE_ID,
    leagueName: "英格兰女足超级联赛",
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
    const players = team.id === teams[0].id ? arsenalPlayers : [legacyMockPlayer];
    return result({ ...team, description: "TheSportsDB 不可用时显示的演示球队。", players });
  },
  async getPlayer(playerId: string): Promise<ApiResult<PlayerDetail>> {
    return result(arsenalPlayers.find((player) => player.id === playerId) ?? legacyMockPlayer);
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
