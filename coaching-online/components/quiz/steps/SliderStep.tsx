import ContinueButton from "@/components/ui/ContinueButton";
import StepHeading from "@/components/ui/StepHeading";
import type { CSSProperties } from "react";

interface SliderStepProps {
  title: string;
  subtitle?: string;
  minLabel: string;
  maxLabel: string;
  emojis: string[];
  nuances: string[];
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
}

function bucketIndex(length: number, value: number) {
  return Math.min(length - 1, Math.floor((value / 100) * length));
}

export default function SliderStep({
  title,
  subtitle,
  minLabel,
  maxLabel,
  emojis,
  nuances,
  value,
  onChange,
  onContinue,
}: SliderStepProps) {
  const index = bucketIndex(emojis.length, value);

  return (
    <div>
      <StepHeading title={title} subtitle={subtitle} />

      <div className="mb-2 text-center text-6xl transition-transform" aria-hidden="true">
        {emojis[index]}
      </div>
      <p className="mb-4 text-center text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-gold">
        {nuances[index]}
      </p>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--slider-progress": `${value}%` } as CSSProperties}
        className="w-full"
        aria-label={title}
      />

      <div className="mt-3 flex justify-between text-[0.7rem] uppercase tracking-[0.14em] text-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      <ContinueButton className="mt-10" onClick={onContinue}>
        Continuer
      </ContinueButton>
    </div>
  );
}
