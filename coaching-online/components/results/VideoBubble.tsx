"use client";

import type { RefObject } from "react";

interface VideoBubbleProps {
  src: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  muted: boolean;
  onToggleMute: () => void;
}

// Autoplay-with-sound is blocked by mobile browsers, so the video always
// starts muted — tapping anywhere on the results card unmutes it (see
// ResultsPageClient's unmuteFromCard). This is a physical constraint of the
// platform, not a design choice.
//
// Deliberately no `loop`: the final montage is a one-time, finite-length
// personalized clip (~1min), and AnimatedCursor paces its whole walk through
// the page against this exact video's duration so both finish together —
// looping the video would leave the cursor frozen while the video restarts.
export default function VideoBubble({ src, videoRef, muted, onToggleMute }: VideoBubbleProps) {
  return (
    <div className="relative h-[112px] w-[84px] shrink-0 overflow-hidden rounded-2xl border-[3px] border-gold shadow-[0_4px_18px_rgba(201,168,76,0.4)] sm:h-[136px] sm:w-[102px]">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted={muted}
          playsInline
          // Mobile browsers give <video> its own native tap handling (play/
          // pause, controls flash) that can swallow the click before it
          // bubbles up — pointer-events-none forces every tap here to fall
          // through to the card's onClick, same as tapping anywhere else.
          className="pointer-events-none h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-black/80 text-2xl">🎬</div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        onTouchEnd={(e) => e.stopPropagation()}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        aria-pressed={!muted}
        className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[0.7rem] text-white shadow-sm transition-transform hover:scale-110 active:scale-95"
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
