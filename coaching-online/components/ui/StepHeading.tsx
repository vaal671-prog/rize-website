interface StepHeadingProps {
  title: string;
  subtitle?: string;
}

export default function StepHeading({ title, subtitle }: StepHeadingProps) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-[clamp(1.8rem,6vw,2.6rem)] leading-[0.95] text-white">{title}</h2>
      {subtitle ? <p className="mt-3 text-[0.9rem] text-muted">{subtitle}</p> : null}
    </div>
  );
}
