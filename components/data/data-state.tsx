import type { ReactNode } from "react";
import { formatUpdatedAt } from "@/lib/formatters/date";
import type { ApiResult } from "@/types/api";

type DataSourceNoteProps = {
  result: Pick<ApiResult<unknown>, "source" | "updatedAt" | "isStale">;
};

// 数据来源提示让用户知道当前内容来自真实接口、缓存、手动资料还是演示兜底数据。
export function DataSourceNote({ result }: DataSourceNoteProps) {
  const sourceText = result.source === "live" ? "实时数据" : result.source === "cache" ? "缓存数据" : result.source === "manual" ? "手动资料" : "演示数据";
  const staleText = result.isStale ? "，可能不是最新" : "";
  return (
    <p className="rounded-md bg-surface px-3 py-2 text-xs font-bold text-muted">
      {sourceText}{staleText} · {formatUpdatedAt(result.updatedAt)}
    </p>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-surface p-6 text-center">
      <h3 className="text-base font-black text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-black text-ink">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
