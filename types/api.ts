// 这个文件定义所有内部 API 都能复用的返回壳。
// 页面只需要看 data，不需要知道数据来自真实接口还是兜底 mock。
export type ApiSource = "live" | "cache" | "mock";

export type ApiResult<T> = {
  data: T;
  source: ApiSource;
  updatedAt: string;
  isStale: boolean;
  error?: string;
};
