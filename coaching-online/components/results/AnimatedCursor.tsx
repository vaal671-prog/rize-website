"use client";

import { useEffect, useRef } from "react";

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Deterministic pseudo-random in [0, 1), stable across renders for a given
// seed — used to vary each segment's curve/timing without reshuffling every
// frame (which would make the path jitter instead of just looking hand-drawn).
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

interface Point {
  x: number;
  y: number;
}

// Walks the fake cursor down through every [data-cursor-target] element in
// DOM order (= the coach's narration order, see profileStats in
// ResultsPageClient) — but instead of running on its own clock, its position
// is derived directly from the <video>'s currentTime/duration. Point 0
// ("Âge") lines up with the start of the video and the last point (the CTA)
// lines up with the very end, so the walk-through finishes exactly when the
// video does — once, no looping back to the top.
export default function AnimatedCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const tapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cursor = cursorRef.current;
    const tap = tapRef.current;
    const root = cursor?.parentElement;
    const video = document.querySelector("video");
    if (!cursor || !root || !video) return;

    let raf = 0;
    let points: Point[] = [];
    let curves: Point[] = []; // one bezier control point per segment, offset from the midpoint
    let cumulative: number[] = []; // progress fraction (0..1) at which each point is reached
    let lastIndex = -1;

    function measure() {
      const rootRect = root!.getBoundingClientRect();
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cursor-target]"));
      points = targets.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - rootRect.left, y: r.top + r.height / 2 - rootRect.top };
      });

      const segmentCount = Math.max(0, points.length - 1);
      curves = [];
      const weights: number[] = [];
      for (let i = 0; i < segmentCount; i++) {
        const from = points[i];
        const to = points[i + 1];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        // Perpendicular unit vector, offset the midpoint along it so the
        // path arcs like a real hand gesture instead of a straight line —
        // direction and amount both vary per segment via the seeded random.
        const nx = -dy / len;
        const ny = dx / len;
        const sign = pseudoRandom(i * 7 + 3) > 0.5 ? 1 : -1;
        const magnitude = len * (0.08 + pseudoRandom(i * 13 + 5) * 0.1);
        curves.push({
          x: (from.x + to.x) / 2 + nx * magnitude * sign,
          y: (from.y + to.y) / 2 + ny * magnitude * sign,
        });
        // Segments don't all take the same share of the video — some
        // stretches feel quicker, some slower, like a real narration pace.
        weights.push(0.7 + pseudoRandom(i + 1) * 0.6);
      }
      const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
      cumulative = [0];
      let acc = 0;
      for (const w of weights) {
        acc += w / totalWeight;
        cumulative.push(acc);
      }
    }

    function pulseTap() {
      if (!tap) return;
      tap.style.animation = "none";
      void tap.offsetWidth; // force reflow so re-setting the animation restarts it
      tap.style.animation = "";
    }

    measure();

    function tick() {
      const duration = video!.duration;
      if (points.length < 2 || !isFinite(duration) || duration <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(1, Math.max(0, video!.currentTime / duration));

      // Find which (unevenly-weighted) segment this progress falls in.
      let index = cumulative.length - 2;
      for (let i = 0; i < cumulative.length - 1; i++) {
        if (progress <= cumulative[i + 1]) {
          index = i;
          break;
        }
      }
      const segStart = cumulative[index];
      const segEnd = cumulative[index + 1];
      const segmentT = segEnd > segStart ? (progress - segStart) / (segEnd - segStart) : 1;
      const eased = easeInOutCubic(Math.min(1, Math.max(0, segmentT)));

      const from = points[index];
      const to = points[index + 1];
      const control = curves[index];
      const oneMinusT = 1 - eased;
      const x = oneMinusT * oneMinusT * from.x + 2 * oneMinusT * eased * control.x + eased * eased * to.x;
      const y = oneMinusT * oneMinusT * from.y + 2 * oneMinusT * eased * control.y + eased * eased * to.y;

      cursor!.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      cursor!.style.opacity = "1";

      const landedIndex = segmentT > 0.5 ? index + 1 : index;
      if (landedIndex !== lastIndex && (segmentT < 0.08 || segmentT > 0.92)) {
        lastIndex = landedIndex;
        pulseTap();
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    function onResize() {
      measure();
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none absolute left-0 top-0 z-40 opacity-0 transition-opacity duration-200"
      aria-hidden="true"
    >
      <span
        ref={tapRef}
        className="absolute left-1/2 top-1/2 h-9 w-9 rounded-full bg-gold"
        style={{ animation: "cursor-tap-once 0.45s ease-out" }}
      />
      <svg width="26" height="26" viewBox="0 0 30 30" className="relative drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
        <path
          d="M6 2 L6 24 L11.5 19 L15 27 L18.5 25.5 L15 17.5 L23 17.5 Z"
          fill="#111111"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
