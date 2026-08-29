// 自定义错误让 adapter 能区分“接口真的失败”和普通代码错误。
export class WslApiError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "WslApiError";
  }
}

export function formatWslApiError(error: unknown) {
  if (error instanceof WslApiError) {
    const cause = describeCause(error.cause);
    return cause ? `${error.message} ${cause}` : error.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "WSL 数据请求失败。";
}

function describeCause(cause: unknown) {
  if (cause instanceof Error) return cause.message;
  if (typeof cause === "string") return cause;
  return "";
}
