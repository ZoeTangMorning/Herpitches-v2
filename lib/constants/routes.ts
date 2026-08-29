// 路径集中管理，页面和导航使用同一组字符串，后续改路由时只需修改一处。
export const routes = {
  home: "/",
  data: "/data",
  news: "/news",
  club: "/club",
  community: "/community",
  me: "/me",
} as const;
