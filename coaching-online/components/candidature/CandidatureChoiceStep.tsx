import CandidatureStepHeading from "@/components/candidature/CandidatureStepHeading";
import type { CandidatureOption } from "@/lib/candidature-data";

interface CandidatureChoiceStepProps {
  title: string;
  options: CandidatureOption[];
  value?: string;
  onSelect: (value: string) => void;
}

export default function CandidatureChoiceStep({
  title,
  options,
  value,
  onSelect,
}: CandidatureChoiceStepProps) {
  return (
    <div>
      <CandidatureStepHeading title={title} />
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`press-scale flex items-center justify-between gap-3 rounded-[var(--r)] border px-6 py-4 text-left transition-all duration-200 ${
                selected
                  ? "border-gold bg-gradient-to-b from-gold/[0.14] to-gold/[0.04] shadow-[0_0_0_1px_rgba(201,168,76,0.3),0_10px_28px_-10px_rgba(201,168,76,0.4)]"
                  : "border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] hover:border-white/25 hover:from-white/[0.08]"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[1rem] font-semibold text-white">{option.label}</span>
                {option.description ? (
                  <span className="mt-1 block text-[0.82rem] leading-snug text-muted">
                    {option.description}
                  </span>
                ) : null}
              </span>
              {selected ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-black">
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">
                    <path
                      d="M1 4.5 4 7.5 10 1.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
