import StepHeading from "@/components/ui/StepHeading";
import type { ChoiceOption } from "@/lib/types";

interface ChoiceStepProps {
  title: string;
  subtitle?: string;
  options: ChoiceOption[];
  value?: string;
  onSelect: (value: string) => void;
}

export default function ChoiceStep({ title, subtitle, options, value, onSelect }: ChoiceStepProps) {
  return (
    <div>
      <StepHeading title={title} subtitle={subtitle} />
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`press-scale rounded-[var(--r)] border px-6 py-4 text-left transition-all ${
                selected
                  ? "border-gold bg-[linear-gradient(180deg,rgba(201,168,76,0.14),rgba(201,168,76,0.05))] shadow-[0_6px_20px_-6px_rgba(201,168,76,0.4)]"
                  : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.4)] hover:border-white/25 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]"
              }`}
            >
              <span className="block text-[1rem] font-semibold text-white">{option.label}</span>
              {option.description ? (
                <span className="mt-1 block text-[0.82rem] leading-snug text-muted">
                  {option.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
