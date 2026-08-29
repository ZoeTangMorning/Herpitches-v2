"use client";

import { useState } from "react";
import { CommentForm } from "@/components/community/comment-form";
import { LikeButton } from "@/components/community/like-button";
import { ReportDialog } from "@/components/community/report-dialog";
import { formatDateTime } from "@/lib/formatters/date";
import type { CommentRecord, ReportReason } from "@/types/community";

type CommentItemProps = {
  comment: CommentRecord;
  isLoggedIn: boolean;
  depth?: number;
  onDelete: (id: string) => Promise<boolean>;
  onReply: (content: string, parentId?: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  onReport: (commentId: string, reason: ReportReason, detail?: string) => Promise<{ ok: boolean; message: string }>;
};

// 单条评论只负责展示和触发回调，数据库读写由外层评论区统一处理。
export function CommentItem({ comment, isLoggedIn, depth = 0, onDelete, onReply, onReport }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [deleted, setDeleted] = useState(comment.status === "deleted");
  const visibleStatus = deleted ? "deleted" : comment.status;

  async function remove() {
    if (await onDelete(comment.id)) setDeleted(true);
  }

  return (
    <article className={`space-y-3 rounded-2xl border border-line bg-white p-4 shadow-panel ${depth ? "ml-4" : ""}`}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words text-sm font-black text-ink">{comment.authorName}</p>
          <p className="mt-1 text-xs text-muted">{formatDateTime(comment.createdAt)}</p>
        </div>
        <StatusBadge status={visibleStatus} />
      </header>
      <p className="break-words text-sm leading-6 text-ink">{commentText(comment, visibleStatus)}</p>
      <div className="flex flex-wrap items-center gap-3">
        {visibleStatus === "approved" ? <LikeButton targetType="comment" targetId={comment.id} initialCount={comment.likeCount} initiallyLiked={comment.likedByMe} compact /> : null}
        {isLoggedIn && depth === 0 && visibleStatus === "approved" ? <button type="button" onClick={() => setReplying(true)} className="text-xs font-bold text-muted hover:text-brand">回复</button> : null}
        {comment.isOwn && visibleStatus !== "deleted" ? <button type="button" onClick={remove} className="text-xs font-bold text-muted hover:text-red-700">删除</button> : null}
        {isLoggedIn && !comment.isOwn && visibleStatus === "approved" ? <ReportDialog commentId={comment.id} onReport={onReport} /> : null}
      </div>
      {replying ? <CommentForm title="回复评论" parentId={comment.id} onSubmit={onReply} onCancel={() => setReplying(false)} /> : null}
      {comment.replies.length ? <div className="space-y-3">{comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} isLoggedIn={isLoggedIn} depth={depth + 1} onDelete={onDelete} onReply={onReply} onReport={onReport} />)}</div> : null}
    </article>
  );
}

function StatusBadge({ status }: { status: CommentRecord["status"] }) {
  const text = { pending: "待审核", approved: "已通过", rejected: "未通过", deleted: "已删除" }[status];
  const color = status === "approved" ? "bg-brand text-white" : "bg-surface text-muted";
  return <span className={`rounded-full px-2 py-1 text-xs font-bold ${color}`}>{text}</span>;
}

function commentText(comment: CommentRecord, status: CommentRecord["status"]) {
  if (status === "deleted") return "这条评论已删除。";
  if (status === "rejected") return "这条评论未通过审核，仅作者可见。";
  return comment.content;
}
