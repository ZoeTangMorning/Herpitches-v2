"use client";

import { CommentItem } from "@/components/community/comment-item";
import type { CommentRecord, ReportReason } from "@/types/community";

type CommentListProps = {
  comments: CommentRecord[];
  isLoggedIn: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onReply: (content: string, parentId?: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  onReport: (commentId: string, reason: ReportReason, detail?: string) => Promise<{ ok: boolean; message: string }>;
};

// 列表保持纵向排列；空状态也占一个卡片，避免页面看起来突然断掉。
export function CommentList({ comments, isLoggedIn, onDelete, onReply, onReport }: CommentListProps) {
  if (!comments.length) {
    return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm leading-6 text-muted">还没有公开评论，成为第一个参与讨论的人吧。</p>;
  }
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} isLoggedIn={isLoggedIn} onDelete={onDelete} onReply={onReply} onReport={onReport} />
      ))}
    </div>
  );
}
