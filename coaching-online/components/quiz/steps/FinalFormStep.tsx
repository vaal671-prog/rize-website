"use client";

import { useState } from "react";
import ContinueButton from "@/components/ui/ContinueButton";
import StepHeading from "@/components/ui/StepHeading";
import { WHATSAPP_DEFAULT_COUNTRY_CODE } from "@/lib/constants";

interface FinalFormStepProps {
  title: string;
  subtitle?: string;
  firstName: string;
  email: string;
  whatsapp: string;
  onFieldChange: (field: "firstName" | "email" | "whatsapp", value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}

// Deliberately excludes width so callers control sizing (the country-code
// field needs a fixed width, which a baked-in w-full would fight with).
const inputClass =
  "rounded-[var(--r)] border border-white/15 bg-white/[0.04] px-4 py-3.5 text-[0.95rem] text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold";

export default function FinalFormStep({
  title,
  subtitle,
  firstName,
  email,
  whatsapp,
  onFieldChange,
  onSubmit,
  submitting,
  error,
}: FinalFormStepProps) {
  const [countryCode, setCountryCode] = useState(WHATSAPP_DEFAULT_COUNTRY_CODE);
  const [localNumber, setLocalNumber] = useState(() =>
    whatsapp.startsWith(WHATSAPP_DEFAULT_COUNTRY_CODE)
      ? whatsapp.slice(WHATSAPP_DEFAULT_COUNTRY_CODE.length).trim()
      : whatsapp,
  );

  const updatePhone = (nextCode: string, nextNumber: string) => {
    setCountryCode(nextCode);
    setLocalNumber(nextNumber);
    onFieldChange("whatsapp", `${nextCode} ${nextNumber}`.trim());
  };

  const canSubmit = firstName.trim() && email.trim() && localNumber.trim() && !submitting;

  return (
    <div>
      <StepHeading title={title} subtitle={subtitle} />

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit();
        }}
      >
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Prénom
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            placeholder="Ton prénom"
            className={`${inputClass} w-full`}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            placeholder="ton@email.com"
            className={`${inputClass} w-full`}
            required
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Numéro WhatsApp
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="tel"
              value={countryCode}
              onChange={(e) => updatePhone(e.target.value, localNumber)}
              aria-label="Indicatif pays"
              className={`${inputClass} w-[76px] shrink-0 text-center`}
            />
            <input
              id="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={localNumber}
              onChange={(e) => updatePhone(countryCode, e.target.value)}
              placeholder="6 12 34 56 78"
              className={`${inputClass} min-w-0 flex-1`}
              required
            />
          </div>
        </div>

        {error ? <p className="text-[0.8rem] text-danger">{error}</p> : null}

        <ContinueButton type="submit" disabled={!canSubmit} className="mt-2">
          {submitting ? "Envoi en cours…" : "Recevoir ma consultation personnalisée 🎁"}
        </ContinueButton>
      </form>
    </div>
  );
}
