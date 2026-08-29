"use client";

import { FormEvent, useState } from "react";
import type { ReportReason } from "@/types/community";

type ReportDialogProps = {
  commentId: string;
  onReport: (commentId: string, reason: ReportReason, detail?: string) => Promise<{ ok: boolean; message: string }>;
};

const reasons: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "垃圾信息" },
  { value: "abuse", label: "攻击辱骂" },
  { value: "misinformation", label: "不实信息" },
  { value: "other", label: "其他原因" },
];

// 首版用轻量弹出层完成举报，不建设后台；处理仍由人工流程完成。
export function ReportDialog({ commentId, onReport }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const result = await onReport(commentId, reason, detail);
    setBusy(false);
    setMessage(result.message);
    if (result.ok) setOpen(false);
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-bold text-muted hover:text-brand">举报</button>
      {open ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/30 px-4 py-6">
          <form onSubmit={submit} className="mx-auto w-full max-w-[448px] space-y-3 rounded-2xl bg-white p-4 shadow-panel">
            <h3 className="text-lg font-black text-ink">举报评论</h3>
            <select value={reason} onChange={(event) => setReason(event.target.value as ReportReason)} className="w-full rounded-xl border border-line px-3 py-3 text-sm outline-none focus:border-brand">
              {reasons.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="可选：补充说明" className="min-h-24 w-full rounded-xl border border-line px-3 py-3 text-sm outline-none focus:border-brand" maxLength={300} />
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy} className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{busy ? "提交中…" : "提交举报"}</button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-muted hover:bg-surface">取消</button>
            </div>
          </form>
        </div>
      ) : null}
      {message ? <p className="mt-1 text-xs text-muted">{message}</p> : null}
    </div>
  );
}
