import type { Fixture, FixtureStatus } from "@/types/wsl";

// 状态文案集中在这里，组件只关心展示，不需要知道英文状态怎么翻译。
const statusText: Record<FixtureStatus, string> = {
  scheduled: "未开赛",
  live: "进行中",
  finished: "已结束",
  postponed: "延期",
  cancelled: "取消",
  unknown: "待确认",
};

export function formatFixtureStatus(status: FixtureStatus) {
  return statusText[status];
}

export function formatScore(fixture: Fixture) {
  const hasHome = typeof fixture.homeScore === "number";
  const hasAway = typeof fixture.awayScore === "number";
  if (hasHome && hasAway) return `${fixture.homeScore} - ${fixture.awayScore}`;
  return fixture.status === "scheduled" ? "vs" : "比分待更新";
}

export function isFinishedFixture(fixture: Fixture) {
  return fixture.status === "finished";
}
