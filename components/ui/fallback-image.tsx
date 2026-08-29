"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FallbackImageProps = {
  src?: string;
  alt: string;
  fallbackText: string;
  compactFallback?: boolean;
  className?: string;
  imageClassName?: string;
  fit?: "cover" | "contain";
};

export function FallbackImage({
  src,
  alt,
  fallbackText,
  compactFallback = true,
  className = "",
  imageClassName = "",
  fit = "cover",
}: FallbackImageProps) {
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
    const text = fallbackText.trim();
    if (!text) return "图";
    if (!compactFallback) return text;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length > 1) return words.map((word) => word[0]).join("").slice(0, 2).toUpperCase();
    return text.slice(0, 2).toUpperCase();
  }, [compactFallback, fallbackText]);

  return (
    <div role="img" aria-label={alt} className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-surface text-center font-black text-brand ${className}`}>
      <span className={loaded ? "opacity-0" : "opacity-100"}>{fallback}</span>
      {src && !broken ? (
        <img
          ref={imageRef}
          src={src}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} transition-opacity duration-200 ${imageClassName} ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
        />
      ) : null}
    </div>
  );
}
