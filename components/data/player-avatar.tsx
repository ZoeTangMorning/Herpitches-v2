"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PlayerAvatarProps = {
  label: string;
  src?: string;
  className?: string;
};

// 球员照片与球队队徽保持相同的加载策略：图片失败时显示姓名缩写。
export function PlayerAvatar({ label, src, className = "h-14 w-14" }: PlayerAvatarProps) {
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
  }, [src]);

  const fallback = useMemo(() => {
    const words = label.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "球";
    return words.map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  }, [label]);

  return (
    <div role="img" aria-label={`${label} 头像`} className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface text-sm font-black text-brand ${className}`}>
      <span className={loaded ? "opacity-0" : "opacity-100"}>{fallback}</span>
      {src && !broken ? (
        <img
          ref={imageRef}
          src={src}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
        />
      ) : null}
    </div>
  );
}
