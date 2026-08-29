import { DEFAULT_SPORTSDB_BASE_URL, DEFAULT_SPORTSDB_KEY, DEFAULT_TIMEOUT_MS } from "@/lib/wsl-api/constants";
import { WslApiError } from "@/lib/wsl-api/errors";

type QueryValue = string | number | undefined;

// client 只负责和 TheSportsDB 说话，不把供应商字段解释成业务含义。
export class TheSportsDbClient {
  private readonly baseUrl = (process.env.WSL_API_BASE_URL ?? DEFAULT_SPORTSDB_BASE_URL).replace(/\/$/, "");
  private readonly apiKey = process.env.WSL_API_KEY || DEFAULT_SPORTSDB_KEY;
  private readonly timeoutMs = Number(process.env.WSL_API_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  async get<T>(endpoint: string, params: Record<string, QueryValue> = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const url = this.buildUrl(endpoint, params);
      const response = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } });
      if (!response.ok) {
        throw new WslApiError(`TheSportsDB 请求失败：${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      throw error instanceof WslApiError ? error : new WslApiError("TheSportsDB 请求异常。", error);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(endpoint: string, params: Record<string, QueryValue>) {
    const url = new URL(`${this.baseUrl}/${this.apiKey}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
    return url;
  }
}
