"use client";

import { useEffect, useRef, useState } from "react";

interface SilhouetteImageProps {
  src: string | null;
  alt: string;
}

export default function SilhouetteImage({ src, alt }: SilhouetteImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Covers the case where the image already failed to load by the time this
    // effect runs (e.g. mounting inside a Suspense boundary can cause the
    // error event to fire before React attaches its listener).
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  if (!src || failed) {
    return (
      <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-[var(--r)] border border-dashed border-white/15 bg-white/[0.03] px-2 text-center">
        <span className="text-2xl">🧍</span>
        {src ? (
          <span className="break-all text-[0.5rem] uppercase tracking-wide text-white/30">
            {src.split("/").pop()}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      onLoad={() => {
        if (imgRef.current && imgRef.current.naturalWidth === 0) setFailed(true);
      }}
      className="aspect-[3/4] w-full rounded-[var(--r)] object-cover"
    />
  );
}
