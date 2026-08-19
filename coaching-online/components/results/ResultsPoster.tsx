import type { RefObject } from "react";
import SilhouetteTile from "@/components/results/SilhouetteTile";
import VideoBubble from "@/components/results/VideoBubble";

interface StatChip {
  id: string;
  label: string;
  value: string;
}

interface ResultsPosterProps {
  prenom: string;
  stats: StatChip[];
  currentImage: string | null;
  currentLabel: string;
  targetImage: string | null;
  targetLabel: string;
  sommeil: number;
  stress: number;
  metabolisme: number;
  calories: number | null;
  maintenance: number | null;
  proteines: number | null;
  glucides: number | null;
  lipides: number | null;
  videoUrl: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  muted: boolean;
  onToggleMute: () => void;
}

function GradientBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-black/10">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(to right, #ef4444, #f59e0b, #eab308, #84cc16, #22c55e)",
        }}
      />
      <div className="absolute inset-y-0 right-0 bg-[#f2f1ee]" style={{ left: `${clamped}%` }} />
    </div>
  );
}

export default function ResultsPoster({
  prenom,
  stats,
  currentImage,
  currentLabel,
  targetImage,
  targetLabel,
  sommeil,
  stress,
  metabolisme,
  calories,
  maintenance,
  proteines,
  glucides,
  lipides,
  videoUrl,
  videoRef,
  muted,
  onToggleMute,
}: ResultsPosterProps) {
  return (
    <div className="flex flex-col rounded-[var(--r-lg)] border border-gold/25 bg-white text-[#111111] shadow-[0_6px_32px_rgba(201,168,76,0.14)]">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-vd.png" alt="VD Performance" className="mb-1.5 h-9 w-9 rounded-full object-cover" />
          <h1 className="truncate text-[clamp(1.4rem,7vw,2rem)] leading-none">
            {prenom || "Ton bilan"}
          </h1>
        </div>

        <VideoBubble src={videoUrl} videoRef={videoRef} muted={muted} onToggleMute={onToggleMute} />
      </div>

      <div className="grid grid-cols-2 gap-1.5 px-4 pt-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-cursor-target={stat.id}
            className="rounded-[var(--r)] bg-black/[0.035] px-2.5 py-1.5 text-center"
          >
            <span className="block truncate text-[0.78rem] font-bold leading-tight">{stat.value}</span>
            <span className="block text-[0.46rem] uppercase tracking-[0.06em] text-black/45">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-2 flex items-center justify-center gap-7 rounded-2xl border-[3px] border-gold bg-gradient-to-br from-gold-dim via-gold-dim to-gold/20 px-4 py-3 shadow-[inset_0_1px_14px_rgba(201,168,76,0.28)]">
        <div data-cursor-target="avant" className="flex">
          <SilhouetteTile src={currentImage} alt={currentLabel} label="Avant" sublabel={currentLabel} />
        </div>
        <div data-cursor-target="apres" className="flex">
          <SilhouetteTile src={targetImage} alt={targetLabel} label="Après" sublabel={targetLabel} />
        </div>
        <div className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-gold text-black shadow-[0_2px_10px_rgba(0,0,0,0.28)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 12h16m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="px-4 pt-2">
        <p className="mb-1 flex items-center justify-center gap-1.5 text-[0.52rem] font-bold uppercase tracking-[0.18em] text-black/35">
          <span className="h-[3px] w-[3px] rounded-full bg-gold" />
          Tes données personnelles
          <span className="h-[3px] w-[3px] rounded-full bg-gold" />
        </p>
        <div className="flex flex-col gap-1">
          {[
            { id: "sommeil", label: "Sommeil", percent: sommeil },
            { id: "stress", label: "Stress", percent: stress },
            { id: "metabolisme", label: "Métabolisme", percent: metabolisme },
          ].map((metric) => (
            <div key={metric.label} data-cursor-target={metric.id} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-[0.55rem] uppercase tracking-[0.04em] text-black/50">
                {metric.label}
              </span>
              <GradientBar percent={metric.percent} />
              <span className="w-7 shrink-0 text-right text-[0.55rem] font-bold">
                {Math.round(Math.min(100, Math.max(0, metric.percent)))}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div data-cursor-target="nutrition" className="mt-2 border-t border-gold/20 px-4 pb-3 pt-2">
        <p className="mb-1.5 flex items-center justify-center gap-1.5 text-[0.52rem] font-bold uppercase tracking-[0.18em] text-black/35">
          <span className="h-[3px] w-[3px] rounded-full bg-gold" />
          Ton plan nutritionnel
          <span className="h-[3px] w-[3px] rounded-full bg-gold" />
        </p>
        <div className="flex items-center justify-center gap-1.5 text-center">
          <div className="rounded-[var(--r)] bg-gold-dim px-2.5 py-1.5">
            <span className="block text-[1.05rem] font-bold leading-none text-gold">
              {calories ?? "—"}
            </span>
            <span className="block text-[0.44rem] uppercase tracking-[0.06em] text-black/45">
              Kcal{maintenance != null ? ` · Maintien ${maintenance}` : ""}
            </span>
          </div>
          <div className="rounded-[var(--r)] bg-black/[0.035] px-2.5 py-1.5">
            <span className="block text-[1.05rem] font-bold leading-none">
              {proteines ?? "—"}
              <span className="text-[0.58rem] font-normal text-black/40">g</span>
            </span>
            <span className="block text-[0.44rem] uppercase tracking-[0.06em] text-black/45">
              Protéines
            </span>
          </div>
          <div className="rounded-[var(--r)] bg-black/[0.035] px-2.5 py-1.5">
            <span className="block text-[1.05rem] font-bold leading-none">
              {glucides ?? "—"}
              <span className="text-[0.58rem] font-normal text-black/40">g</span>
            </span>
            <span className="block text-[0.44rem] uppercase tracking-[0.06em] text-black/45">
              Glucides
            </span>
          </div>
          <div className="rounded-[var(--r)] bg-black/[0.035] px-2.5 py-1.5">
            <span className="block text-[1.05rem] font-bold leading-none">
              {lipides ?? "—"}
              <span className="text-[0.58rem] font-normal text-black/40">g</span>
            </span>
            <span className="block text-[0.44rem] uppercase tracking-[0.06em] text-black/45">
              Lipides
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
