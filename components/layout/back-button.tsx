"use client";

import { useRouter } from "next/navigation";

// 统一的历史回退按钮，尽量只承担“回到上一页”这一件事。
export function BackButton() {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/news");
      return;
    }
    router.back();
  }

  return (
    <button
      type="button"
      aria-label="返回上一页"
      onClick={goBack}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-lg font-black text-brand shadow-panel transition-colors hover:border-brand hover:bg-surface"
    >
      <span aria-hidden="true">&lt;</span>
    </button>
  );
}
