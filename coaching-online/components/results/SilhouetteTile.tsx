"use client";

import { useEffect, useRef, useState } from "react";

interface SilhouetteTileProps {
  src: string | null;
  alt: string;
  label: string;
  sublabel: string;
}

// Light-themed variant of components/ui/SilhouetteImage — kept separate
// because that component is shared with the protected quiz SilhouetteStep
// and must not change its (dark) styling.
export default function SilhouetteTile({ src, alt, label, sublabel }: SilhouetteTileProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="shrink-0 text-center text-[0.6rem] font-bold uppercase tracking-[0.16em] text-black/55">
        {label}
      </span>
      <span className="shrink-0 truncate text-center text-[0.5rem] font-semibold leading-none text-gold">
        {sublabel}
      </span>
      {/* Fixed height (width follows via aspect-ratio) — the page now grows
          to fit its content instead of clipping to one screen, so there's
          no bounded parent height left to derive a flex-1 size from. */}
      <div className="relative aspect-[2/3] h-[21vh] max-h-[180px] min-h-[140px] overflow-hidden rounded-[var(--r)] border border-gold/40 bg-black/85">
        {src && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            onLoad={() => {
              if (imgRef.current && imgRef.current.naturalWidth === 0) setFailed(true);
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🧍</div>
        )}
      </div>
    </div>
  );
}
