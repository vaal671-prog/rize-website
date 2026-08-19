import type { ButtonHTMLAttributes } from "react";

export default function ContinueButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`press-scale inline-flex w-full items-center justify-center gap-2 rounded-[var(--r)] bg-[linear-gradient(180deg,var(--gold-hover)_0%,var(--gold)_60%)] px-8 py-4 text-[0.75rem] font-extrabold uppercase tracking-[0.2em] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_28px_-8px_rgba(201,168,76,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_14px_34px_-8px_rgba(201,168,76,0.7)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
