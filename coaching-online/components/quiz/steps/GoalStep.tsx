import StepHeading from "@/components/ui/StepHeading";
import type { ChoiceOption } from "@/lib/types";

interface GoalStepProps {
  title: string;
  subtitle?: string;
  options: ChoiceOption[];
  value?: string;
  onSelect: (value: string) => void;
}

const ICONS: Record<string, string> = {
  perte_gras: "🔥",
  prise_muscle: "💪",
};

export default function GoalStep({ title, subtitle, options, value, onSelect }: GoalStepProps) {
  return (
    <div>
      <StepHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`flex flex-col items-center gap-3 rounded-[var(--r)] border px-6 py-10 transition-colors ${
                selected
                  ? "border-gold bg-gold/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <span className="text-4xl">{ICONS[option.value] ?? "🎯"}</span>
              <span className="text-[1.1rem] font-bold text-white">{option.label}</span>
              {option.description ? (
                <span className="text-center text-[0.82rem] leading-snug text-muted">
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
