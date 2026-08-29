import type { PostInput } from "@/types/community";

type ParseResult = { ok: true; value: PostInput } | { ok: false; message: string };

const maxLength = 500;

// 发帖和评论保持同一档内容长度，社区身份由服务端再次校验。
export function parsePostInput(body: unknown): ParseResult {
  const data = body as Record<string, unknown>;
  const communityId = stringValue(data.communityId);
  const content = stringValue(data.content);
  if (!communityId) return { ok: false, message: "缺少社区 ID。" };
  if (!content || content.length < 2) return { ok: false, message: "帖子至少需要 2 个字。" };
  if (content.length > maxLength) return { ok: false, message: `帖子不能超过 ${maxLength} 个字。` };
  return { ok: true, value: { communityId, content } };
}

export function parseCommunityId(value: string | null) {
  const id = value?.trim();
  return id ? { ok: true as const, value: id } : { ok: false as const, message: "缺少社区 ID。" };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
