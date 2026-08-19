import ContinueButton from "@/components/ui/ContinueButton";
import StepHeading from "@/components/ui/StepHeading";

interface NumberStepProps {
  title: string;
  subtitle?: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
}

export default function NumberStep({
  title,
  subtitle,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  onContinue,
}: NumberStepProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div>
      <StepHeading title={title} subtitle={subtitle} />

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          aria-label="Diminuer"
          onClick={() => onChange(clamp(value - step))}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-white transition-colors hover:border-gold hover:text-gold"
        >
          −
        </button>

        <div className="flex min-w-[140px] flex-col items-center">
          <input
            type="number"
            inputMode="numeric"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
            className="w-full bg-transparent text-center text-[3.2rem] font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted">{unit}</span>
        </div>

        <button
          type="button"
          aria-label="Augmenter"
          onClick={() => onChange(clamp(value + step))}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-white transition-colors hover:border-gold hover:text-gold"
        >
          +
        </button>
      </div>

      <ContinueButton className="mt-10" onClick={onContinue}>
        Continuer
      </ContinueButton>
    </div>
  );
}
