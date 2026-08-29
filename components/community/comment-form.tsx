"use client";

import { FormEvent, useState } from "react";

type SubmitResult = { ok: true } | { ok: false; message: string };

type CommentFormProps = {
  title?: string;
  parentId?: string;
  onCancel?: () => void;
  onSubmit: (content: string, parentId?: string) => Promise<SubmitResult>;
};

// 这个表单只收集文本；真正的登录校验和审核状态由服务端 API 决定。
export function CommentForm({ title = "写评论", parentId, onCancel, onSubmit }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await onSubmit(content, parentId);
    setBusy(false);
    if (!result.ok) return setMessage(result.message);
    setContent("");
    setMessage("已提交，审核通过前仅你自己可见。");
    onCancel?.();
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-line bg-white p-4 shadow-panel">
      <label className="block text-sm font-black text-ink" htmlFor={parentId ? `reply-${parentId}` : "comment-content"}>{title}</label>
      <textarea
        id={parentId ? `reply-${parentId}` : "comment-content"}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="说说你的看法，审核通过后会公开显示。"
        className="min-h-28 w-full resize-y rounded-xl border border-line px-3 py-3 text-sm leading-6 outline-none focus:border-brand"
        maxLength={500}
        required
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy} className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{busy ? "提交中…" : "提交"}</button>
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-xl px-3 py-2 text-sm font-bold text-muted hover:bg-surface">取消</button> : null}
      </div>
      {message ? <p role="status" className="text-sm leading-6 text-muted">{message}</p> : null}
    </form>
  );
}
