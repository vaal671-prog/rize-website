import type { ReactNode } from "react";
import CandidatureProgressBar from "@/components/candidature/CandidatureProgressBar";

interface CandidatureShellProps {
  current: number;
  total: number;
  onBack?: () => void;
  stepKey: string;
  children: ReactNode;
}

export default function CandidatureShell({
  current,
  total,
  onBack,
  stepKey,
  children,
}: CandidatureShellProps) {
  return (
    <div className="ambient-atmosphere relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-page">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/[0.06] bg-page/90 px-5 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="Retour"
          className="press-scale flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors enabled:hover:border-gold enabled:hover:text-gold disabled:opacity-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 13 4 8l6-5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <CandidatureProgressBar current={current} total={total} />
        <span className="shrink-0 text-[0.68rem] font-semibold tabular-nums text-muted">
          {current + 1}/{total}
        </span>
      </header>

      <main className="relative z-[1] flex flex-1 items-center justify-center px-5 py-10">
        <div key={stepKey} className="step-enter w-full max-w-[560px]">
          {children}
        </div>
      </main>
    </div>
  );
}
