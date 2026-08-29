import Link from "next/link";
import { formatDateTime } from "@/lib/formatters/date";
import type { CommentRecord } from "@/types/community";

type MyCommentListProps = { comments: CommentRecord[] };

// 个人评论记录允许作者看到所有审核状态，但不把这些状态展示给其他用户。
export function MyCommentList({ comments }: MyCommentListProps) {
  if (!comments.length) return <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">还没有评论记录。</p>;
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <article key={comment.id} className="space-y-3 rounded-2xl border border-line bg-white p-4 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted">{formatDateTime(comment.createdAt)}</span>
            <Status status={comment.status} />
          </div>
          <p className="break-words text-sm leading-6 text-ink">{comment.content}</p>
          <Link href={`/news/${comment.articleId}#comments`} className="text-xs font-bold text-brand">查看所属新闻</Link>
        </article>
      ))}
    </div>
  );
}

function Status({ status }: { status: CommentRecord["status"] }) {
  const text = { pending: "待审核", approved: "已通过", rejected: "未通过", deleted: "已删除" }[status];
  return <span className="rounded-full bg-surface px-2 py-1 text-xs font-bold text-muted">{text}</span>;
}
