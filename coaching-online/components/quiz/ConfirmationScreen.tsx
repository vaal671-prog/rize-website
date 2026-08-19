interface ConfirmationScreenProps {
  firstName: string;
}

function CheckIcon() {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
      <path
        d="M2 10.5 9.5 18 24 2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ConfirmationScreen({ firstName }: ConfirmationScreenProps) {
  return (
    <section className="flex min-h-[100dvh] flex-col items-center justify-center bg-page px-6 py-20 text-center">
      <div className="w-full max-w-[440px] rounded-[var(--r-lg)] border border-white/10 bg-charcoal px-8 py-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <CheckIcon />
        </span>
        <h1 className="mt-6 text-[clamp(2.2rem,8vw,3.2rem)] leading-[0.95] text-white">
          Merci{firstName ? `, ${firstName}` : ""} !
        </h1>
        <p className="mx-auto mt-5 max-w-[380px] text-[0.95rem] leading-relaxed text-muted">
          Ta consultation personnalisée arrive sous 24 à 48h par WhatsApp ou
          email. En attendant, prépare-toi à passer à l&apos;action.
        </p>
      </div>
    </section>
  );
}
