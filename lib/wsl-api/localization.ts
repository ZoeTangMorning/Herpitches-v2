const teamNames: Record<string, string> = {
  "Arsenal WFC": "阿森纳女足",
  "Arsenal Women": "阿森纳女足",
  "Aston Villa WFC": "阿斯顿维拉女足",
  "Aston Villa Women": "阿斯顿维拉女足",
  "Birmingham City WFC": "伯明翰城女足",
  "Brighton WFC": "布莱顿女足",
  "Brighton & Hove Albion Women": "布莱顿女足",
  "Charlton Athletic WFC": "查尔顿竞技女足",
  "Chelsea Women": "切尔西女足",
  "Chelsea WFC": "切尔西女足",
  "Crystal Palace FC Women": "水晶宫女足",
  "Crystal Palace Women": "水晶宫女足",
  "Everton FC Women": "埃弗顿女足",
  "Everton Women": "埃弗顿女足",
  "Leicester City WFC": "莱斯特城女足",
  "Leicester City Women": "莱斯特城女足",
  "Liverpool FC Women": "利物浦女足",
  "Liverpool Women": "利物浦女足",
  "London City Lionesses": "伦敦城雌狮",
  "Manchester City Women": "曼城女足",
  "Manchester City WFC": "曼城女足",
  "Manchester United Women": "曼联女足",
  "Manchester United WFC": "曼联女足",
  "Tottenham Hotspur Women": "托特纳姆热刺女足",
  "Tottenham Hotspur WFC": "托特纳姆热刺女足",
  "Tottenham Women": "托特纳姆热刺女足",
  "West Ham United Women": "西汉姆联女足",
  "West Ham United WFC": "西汉姆联女足",
  "West Ham Women": "西汉姆联女足",
};

const countryNames: Record<string, string> = {
  England: "英格兰",
  Spain: "西班牙",
  Scotland: "苏格兰",
  Wales: "威尔士",
  Ireland: "爱尔兰",
  "Northern Ireland": "北爱尔兰",
  France: "法国",
  Germany: "德国",
  Italy: "意大利",
  Portugal: "葡萄牙",
  Netherlands: "荷兰",
  Belgium: "比利时",
  Sweden: "瑞典",
  Norway: "挪威",
  Denmark: "丹麦",
  Switzerland: "瑞士",
  Austria: "奥地利",
  Iceland: "冰岛",
  Australia: "澳大利亚",
  "New Zealand": "新西兰",
  USA: "美国",
  Canada: "加拿大",
  Brazil: "巴西",
  Colombia: "哥伦比亚",
  Jamaica: "牙买加",
  Japan: "日本",
  China: "中国",
  Nigeria: "尼日利亚",
  "South Africa": "南非",
};

const positionNames: Record<string, string> = {
  goalkeeper: "门将",
  keeper: "门将",
  defender: "后卫",
  "centre-back": "中后卫",
  "center-back": "中后卫",
  "central defender": "中后卫",
  "left-back": "左后卫",
  "right-back": "右后卫",
  midfielder: "中场",
  "central midfield": "中场",
  "defensive midfield": "防守型中场",
  "attacking midfield": "进攻型中场",
  winger: "边锋",
  "left winger": "左边锋",
  "right winger": "右边锋",
  forward: "前锋",
  "centre-forward": "中锋",
  "center-forward": "中锋",
  striker: "前锋",
};

const leagueNames: Record<string, string> = {
  "English Womens Super League": "英格兰女足超级联赛",
  "English Women's Super League": "英格兰女足超级联赛",
  "FA Women's Super League": "英格兰女足超级联赛",
  "UEFA Women's Champions League": "欧足联女子冠军联赛",
  "Women's FA Cup": "英格兰女子足总杯",
  "FA Women's League Cup": "英格兰女子联赛杯",
};

const eventNames: Record<string, string> = {
  goal: "进球",
  "own goal": "乌龙球",
  "yellow card": "黄牌",
  "red card": "红牌",
  substitution: "换人",
  penalty: "点球",
  "missed penalty": "点球未进",
};

const statNames: Record<string, string> = {
  shots: "射门",
  "shots on goal": "射正",
  "shots off goal": "射偏",
  possession: "控球率",
  corners: "角球",
  fouls: "犯规",
  offsides: "越位",
  saves: "扑救",
  passes: "传球",
  "yellow cards": "黄牌",
  "red cards": "红牌",
};

const playerNames: Record<string, string> = {
  "Alessia Russo": "阿莱西娅·鲁索",
  "Leah Williamson": "莉娅·威廉森",
  "Mariona Caldentey": "玛丽奥娜·卡尔登泰",
};

const teamDescriptions: Record<string, string> = {
  "140219": "阿森纳女足是阿森纳足球俱乐部旗下的职业女子足球队，拥有悠久历史，并长期参加英格兰最高级别女子足球赛事。",
  "140220": "阿斯顿维拉女足是阿斯顿维拉足球俱乐部旗下的职业女子足球队。",
  "140221": "伯明翰城女足是伯明翰城足球俱乐部旗下的女子足球队。",
  "140222": "布莱顿女足是布莱顿与霍夫阿尔比恩足球俱乐部旗下的职业女子足球队。",
  "140224": "切尔西女足是切尔西足球俱乐部旗下的职业女子足球队，也是英格兰女子足球的重要力量之一。",
  "140537": "水晶宫女足是水晶宫足球俱乐部旗下的职业女子足球队。",
  "140225": "埃弗顿女足是埃弗顿足球俱乐部旗下的职业女子足球队。",
  "140532": "利物浦女足是利物浦足球俱乐部旗下的职业女子足球队。",
  "140399": "伦敦城雌狮是一支位于伦敦的职业女子足球队。",
};

export function localizeTeamName(value?: string) {
  return value ? teamNames[value] ?? value : "暂未提供";
}

export function localizeCountry(value?: string) {
  return value ? countryNames[value] ?? value : undefined;
}

export function localizeLeagueName(value?: string) {
  return value ? leagueNames[value] ?? value : "英格兰女足超级联赛";
}

export function localizePosition(value?: string) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return positionNames[normalized] ?? value;
}

export function localizePlayerName(value?: string) {
  return value ? playerNames[value] : undefined;
}

export function localizeTeamDescription(teamId?: string, fallback?: string) {
  return teamId ? teamDescriptions[teamId] ?? fallback : fallback;
}

export function localizeEventName(value?: string) {
  if (!value) return "比赛事件";
  return eventNames[value.trim().toLowerCase()] ?? value;
}

export function localizeStatName(value?: string) {
  if (!value) return "统计";
  return statNames[value.trim().toLowerCase()] ?? value;
}
