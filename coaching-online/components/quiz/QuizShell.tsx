import type { ReactNode } from "react";
import ProgressBar from "@/components/quiz/ProgressBar";

interface QuizShellProps {
  percent: number;
  onBack?: () => void;
  stepKey: string;
  children: ReactNode;
}

export default function QuizShell({ percent, onBack, stepKey, children }: QuizShellProps) {
  return (
    <div className="ambient-atmosphere relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-page">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/[0.06] bg-page/80 px-5 py-4 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="Retour"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors enabled:hover:border-gold enabled:hover:text-gold disabled:opacity-0"
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
        <ProgressBar percent={percent} />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div key={stepKey} className="step-enter w-full max-w-[560px]">
          {children}
        </div>
      </main>
    </div>
  );
}
