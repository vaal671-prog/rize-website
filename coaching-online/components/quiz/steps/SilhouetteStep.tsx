import SilhouetteImage from "@/components/ui/SilhouetteImage";
import StepHeading from "@/components/ui/StepHeading";
import type { SilhouetteOption } from "@/lib/types";

interface SilhouetteStepProps {
  title: string;
  subtitle?: string;
  options: SilhouetteOption[];
  value?: string;
  onSelect: (value: string) => void;
}

export default function SilhouetteStep({
  title,
  subtitle,
  options,
  value,
  onSelect,
}: SilhouetteStepProps) {
  return (
    <div>
      <StepHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-[var(--r)] border p-2 text-center transition-colors ${
                selected
                  ? "border-gold bg-gold/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <SilhouetteImage src={option.image} alt={option.label} />
              <span className="mt-2 block text-[0.78rem] font-medium text-white">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
