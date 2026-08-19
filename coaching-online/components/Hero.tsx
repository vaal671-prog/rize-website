interface HeroProps {
  onStart: () => void;
}

interface Feature {
  title: string;
  description: string;
  icon: () => React.JSX.Element;
}

function FlameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1.5 1 2 2.8 2 4.3A5.3 5.3 0 0 1 11.7 20 5.5 5.5 0 0 1 6 14.6C6 10 12 8 12 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12h4l2.5-7L13 19l2.5-7H22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TransformIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 17 9 9l4 4 8-10M21 3h-5M21 3v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m16 10 6-3.5v11L16 14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const STATS = [
  { value: "100%", label: "Personnalisé" },
  { value: "2 min", label: "Chrono" },
  { value: "0€", label: "Gratuit" },
];

const FEATURES: Feature[] = [
  {
    title: "Tes calories & macros exacts",
    description: "Protéines, glucides & lipides calculés pour ton corps.",
    icon: FlameIcon,
  },
  {
    title: "Ton bilan sommeil, stress & métabolisme",
    description: "Ton hygiène de vie, analysée en quelques questions.",
    icon: PulseIcon,
  },
  {
    title: "Ta transformation visualisée",
    description: "Ta silhouette actuelle et ton objectif, mis en perspective.",
    icon: TransformIcon,
  },
  {
    title: "Une vidéo personnalisée pour toi",
    description: "Une analyse en vidéo, créée spécialement pour toi.",
    icon: VideoIcon,
  },
];

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="flex min-h-[100dvh] flex-col items-center justify-center bg-page px-5 py-16 text-center">
      <div className="w-full max-w-[520px]">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.22em] text-gold">
          Diagnostic sur-mesure · VD Performance
        </span>

        <h1 className="text-[clamp(2.6rem,10vw,4.2rem)] leading-[0.92] text-white">
          Ta Consultation
          <br />
          <em>100% Personnalisée</em>
        </h1>

        <p className="mx-auto mt-5 max-w-[420px] text-[0.92rem] leading-relaxed text-muted">
          Réponds à quelques questions et reçois{" "}
          <span className="font-semibold text-white">tes chiffres exacts</span>. Pas de
          moyenne, pas de copier-coller.
        </p>

        <div className="mt-8 grid grid-cols-3 divide-x divide-white/10 rounded-[var(--r-lg)] border border-white/10 bg-charcoal py-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <span className="block text-[1.3rem] font-bold leading-none text-white">
                {stat.value}
              </span>
              <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.1em] text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col divide-y divide-white/[0.06] rounded-[var(--r-lg)] border border-white/10 bg-charcoal">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex items-center gap-3.5 px-5 py-4 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--r)] bg-gold/10 text-gold">
                  <Icon />
                </span>
                <span>
                  <span className="block text-[0.9rem] font-semibold text-white">
                    {feature.title}
                  </span>
                  <span className="mt-0.5 block text-[0.78rem] leading-snug text-muted">
                    {feature.description}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onStart}
          className="btn-glow mt-8 inline-flex w-full items-center justify-center gap-3 rounded-[var(--r)] bg-gold px-14 py-5 text-[0.8rem] font-extrabold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-0.5 hover:bg-gold-hover"
        >
          Commencer mon bilan maintenant →
        </button>

        <p className="mt-4 text-[0.68rem] uppercase tracking-[0.08em] text-white/40">
          ✓ Analyse humaine · ✓ Sur-mesure · ✓ Coaching expert
        </p>
      </div>
    </section>
  );
}
