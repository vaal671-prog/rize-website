interface CandidatureProgressBarProps {
  current: number;
  total: number;
}

export default function CandidatureProgressBar({ current, total }: CandidatureProgressBarProps) {
  return (
    <div
      className="flex w-full gap-1"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isDone = index < current;
        const isActive = index === current;
        return (
          <span
            key={index}
            className={`h-1 flex-1 overflow-hidden rounded-full transition-colors duration-300 ${
              isDone || isActive ? "bg-gold/25" : "bg-white/10"
            }`}
          >
            <span
              className="block h-full rounded-full bg-gold transition-[width] duration-500"
              style={{
                width: isDone ? "100%" : isActive ? "45%" : "0%",
                boxShadow: isActive ? "0 0 6px rgba(201,168,76,0.7)" : "none",
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
