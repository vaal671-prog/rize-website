interface CandidatureStepHeadingProps {
  title: string;
  subtitle?: string;
}

export default function CandidatureStepHeading({ title, subtitle }: CandidatureStepHeadingProps) {
  return (
    <div className="mb-8 text-center">
      <span className="mx-auto mb-3 block h-px w-8 bg-gold/60" aria-hidden="true" />
      <h2 className="text-[clamp(1.8rem,6vw,2.6rem)] leading-[0.95] text-white">{title}</h2>
      {subtitle ? <p className="mt-3 text-[0.9rem] text-muted">{subtitle}</p> : null}
    </div>
  );
}
