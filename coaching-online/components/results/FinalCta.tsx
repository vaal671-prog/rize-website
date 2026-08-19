import { buildBookingUrl } from "@/lib/results-data";

interface FinalCtaProps {
  prenom: string;
  phone: string | null;
  email: string | null;
}

export default function FinalCta({ prenom, phone, email }: FinalCtaProps) {
  // Goes through the /candidature qualification questions first — that page
  // carries the contact info onward to the real Calendly link.
  const href = buildBookingUrl("/candidature", { prenom, phone, email });

  return (
    <a
      href={href}
      data-cursor-target="cta"
      className="btn-glow cta-pulse flex flex-col items-center justify-center gap-1 rounded-full bg-gold px-8 py-5 text-center text-black transition-transform hover:-translate-y-0.5 hover:bg-gold-hover"
    >
      <span className="whitespace-nowrap text-[0.88rem] font-extrabold uppercase tracking-[0.12em]">
        Rejoindre le programme
      </span>
      <span className="text-[0.62rem] font-medium normal-case tracking-normal text-black/60">
        Places limitées · Sélection sur profil
      </span>
    </a>
  );
}
