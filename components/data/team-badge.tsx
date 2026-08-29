"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TeamBadgeProps = {
  label: string;
  teamId?: string;
  src?: string;
  className?: string;
};

// 统一处理球队/队徽图，缺图时退回到首字而不是露出破图标识。
export function TeamBadge({ label, teamId, src, className = "h-12 w-12" }: TeamBadgeProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setBroken(false);
    const image = imageRef.current;
    if (!image?.complete) return;
    if (image.naturalWidth > 0) setLoaded(true);
    else setBroken(true);
  }, [src, teamId]);

  const fallback = useMemo(() => {
    const text = label.trim();
    if (!text) return "队";
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length > 1) return words.map((word) => word[0]).join("").slice(0, 2).toUpperCase();
    return text.slice(0, 2).toUpperCase();
  }, [label]);

  return (
    <div
      role="img"
      aria-label={`${label} 队徽`}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface text-center text-xs font-black leading-none text-brand ${className}`}
    >
      <span className={loaded ? "opacity-0" : "opacity-100"}>{fallback}</span>
      {src && !broken ? (
        <img
          ref={imageRef}
          src={src}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
        />
      ) : null}
    </div>
  );
}
