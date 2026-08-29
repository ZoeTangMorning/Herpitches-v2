"use client";

import Link from "next/link";
import { useState } from "react";
import { CommentForm } from "@/components/community/comment-form";
import { CommentList } from "@/components/community/comment-list";
import type { CommentRecord, ReportReason } from "@/types/community";

type CommentSectionProps = {
  articleId: string;
  initialComments: CommentRecord[];
  isLoggedIn: boolean;
  loadError?: string;
};

// 评论区统一管理前端状态，子组件只通过回调告诉它发生了什么。
export function CommentSection({ articleId, initialComments, isLoggedIn, loadError }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [message, setMessage] = useState("");

  async function submit(content: string, parentId?: string) {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, content, parentId }),
    });
    if (response.status === 401) return { ok: false as const, message: "请先登录后再评论。" };
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.data) return { ok: false as const, message: payload.message ?? "评论提交失败。" };
    setComments((current) => insertComment(current, payload.data, parentId));
    return { ok: true as const };
  }

  async function remove(id: string) {
    const response = await fetch(`/api/comments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage(response.status === 401 ? "请先登录。" : "删除失败，请稍后重试。");
      return false;
    }
    setComments((current) => markDeleted(current, id));
    return true;
  }

  async function report(commentId: string, reason: ReportReason, detail?: string) {
    const response = await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, reason, detail }),
    });
    if (response.status === 401) return { ok: false, message: "请先登录后再举报。" };
    if (!response.ok) return { ok: false, message: "举报提交失败。" };
    return { ok: true, message: "举报已提交，我们会人工处理。" };
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-black text-ink">评论</h2>
        <p className="mt-2 text-sm leading-6 text-muted">新评论会先进入审核，公开列表只展示已通过内容。</p>
      </header>
      {loadError ? <p className="rounded-2xl bg-surface p-4 text-sm leading-6 text-red-700">{loadError}</p> : null}
      {isLoggedIn ? <CommentForm onSubmit={submit} /> : <LoginHint articleId={articleId} />}
      {message ? <p role="status" className="text-sm text-muted">{message}</p> : null}
      <CommentList comments={comments} isLoggedIn={isLoggedIn} onDelete={remove} onReply={submit} onReport={report} />
    </section>
  );
}

function LoginHint({ articleId }: { articleId: string }) {
  return <Link href={`/auth/login?next=${encodeURIComponent(`/news/${articleId}`)}`} className="block rounded-2xl border border-line bg-surface p-4 text-sm font-bold leading-6 text-brand">登录后参与评论、点赞和举报。</Link>;
}

function insertComment(list: CommentRecord[], comment: CommentRecord, parentId?: string): CommentRecord[] {
  if (!parentId) return [comment, ...list];
  return list.map((item) => item.id === parentId ? { ...item, replies: [...item.replies, comment] } : { ...item, replies: insertComment(item.replies, comment, parentId) });
}

function markDeleted(list: CommentRecord[], id: string): CommentRecord[] {
  return list.map((item) => item.id === id ? { ...item, status: "deleted" } : { ...item, replies: markDeleted(item.replies, id) });
}
