interface ProgressBarProps {
  percent: number;
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--gold-hover),var(--gold))] shadow-[0_0_10px_rgba(201,168,76,0.55)] transition-[width] duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
