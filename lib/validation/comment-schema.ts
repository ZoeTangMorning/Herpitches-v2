import type { CommentInput } from "@/types/community";

type ParseResult = { ok: true; value: CommentInput } | { ok: false; message: string };

const maxLength = 500;

// 这里不用复杂库，只做首版最重要的检查：文章、内容、回复对象是否像正常字符串。
export function parseCommentInput(body: unknown): ParseResult {
  const data = body as Record<string, unknown>;
  const articleId = stringValue(data.articleId);
  const content = stringValue(data.content);
  const parentId = stringValue(data.parentId);
  if (!articleId) return { ok: false, message: "缺少文章 ID。" };
  if (!content || content.length < 2) return { ok: false, message: "评论至少需要 2 个字。" };
  if (content.length > maxLength) return { ok: false, message: `评论不能超过 ${maxLength} 个字。` };
  return { ok: true, value: { articleId, content, parentId } };
}

export function parseCommentId(value: string | null) {
  const id = value?.trim();
  return id ? { ok: true as const, value: id } : { ok: false as const, message: "缺少评论 ID。" };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
