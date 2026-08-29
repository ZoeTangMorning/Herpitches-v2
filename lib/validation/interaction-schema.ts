import type { LikeTargetType, ReportInput, ReportReason } from "@/types/community";

type LikeInput = { targetType: LikeTargetType; targetId: string };
type Parsed<T> = { ok: true; value: T } | { ok: false; message: string };

const likeTargets: LikeTargetType[] = ["article", "comment"];
const reportReasons: ReportReason[] = ["spam", "abuse", "misinformation", "other"];

// 点赞只需要目标类型和目标 ID，用户身份由服务端 Cookie 判断。
export function parseLikeInput(body: unknown): Parsed<LikeInput> {
  const data = body as Record<string, unknown>;
  const targetType = data.targetType;
  const targetId = stringValue(data.targetId);
  if (!likeTargets.includes(targetType as LikeTargetType) || !targetId) {
    return { ok: false, message: "点赞对象信息不完整。" };
  }
  return { ok: true, value: { targetType: targetType as LikeTargetType, targetId } };
}

export function parseLikeQuery(params: URLSearchParams): Parsed<LikeInput> {
  return parseLikeInput({ targetType: params.get("targetType"), targetId: params.get("targetId") });
}

// 举报只允许固定原因，避免用户随便传入无法统计的分类。
export function parseReportInput(body: unknown): Parsed<ReportInput> {
  const data = body as Record<string, unknown>;
  const commentId = stringValue(data.commentId);
  const reason = data.reason;
  const detail = stringValue(data.detail);
  if (!commentId || !reportReasons.includes(reason as ReportReason)) {
    return { ok: false, message: "举报原因或评论 ID 不完整。" };
  }
  return { ok: true, value: { commentId, reason: reason as ReportReason, detail } };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
