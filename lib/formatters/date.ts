// 日期格式化只负责“怎么显示”，不负责请求数据。
// 页面和组件都用这里的方法，避免每个文件写一遍日期处理逻辑。
const chinaDateTime = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const chinaDate = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatDateTime(value?: string) {
  const date = toDate(value);
  return date ? chinaDateTime.format(date) : "时间待定";
}

export function formatDateOnly(value?: string) {
  const date = toDate(value);
  return date ? chinaDate.format(date) : "日期待定";
}

export function formatUpdatedAt(value: string) {
  return `更新于 ${formatDateTime(value)}`;
}
