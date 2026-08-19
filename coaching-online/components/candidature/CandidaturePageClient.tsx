"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import CandidatureShell from "@/components/candidature/CandidatureShell";
import CandidatureChoiceStep from "@/components/candidature/CandidatureChoiceStep";
import { CANDIDATURE_STEPS } from "@/lib/candidature-data";
import { CALENDLY_URL, INSTAGRAM_URL, SUBMIT_ENDPOINT } from "@/lib/constants";
import { buildBookingUrl } from "@/lib/results-data";

const SELECT_ADVANCE_DELAY_MS = 220;

// Matches the app's dark theme (see globals.css --page/--gold) so the embed
// doesn't flash a white Calendly frame inside a dark page.
const CALENDLY_EMBED_THEME = "background_color=262625&text_color=ffffff&primary_color=c9a84c&hide_gdpr_banner=1";

type Phase = "quiz" | "booking" | "rejected";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

export default function CandidaturePageClient() {
  const searchParams = useSearchParams();
  const prenom = searchParams.get("prenom") ?? "";
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("quiz");
  const calendlyContainerRef = useRef<HTMLDivElement>(null);

  const currentStep = CANDIDATURE_STEPS[currentIndex];
  const calendlyUrl = `${buildBookingUrl(CALENDLY_URL, { prenom, phone, email })}&${CALENDLY_EMBED_THEME}`;

  // The widget script only auto-scans the DOM at load time, so a container
  // that appears later (once the candidate reaches this phase) needs to be
  // initialized explicitly. Poll briefly in case the script is still
  // finishing its preload from the quiz phase.
  useEffect(() => {
    if (phase !== "booking") return;

    let cancelled = false;
    let attempts = 0;

    function tryInit() {
      if (cancelled) return;
      const container = calendlyContainerRef.current;
      if (window.Calendly && container) {
        container.innerHTML = "";
        window.Calendly.initInlineWidget({ url: calendlyUrl, parentElement: container });
        return;
      }
      if (attempts++ < 50) {
        window.setTimeout(tryInit, 100);
      }
    }

    tryInit();
    return () => {
      cancelled = true;
    };
  }, [phase, calendlyUrl]);

  async function submitToSheet(finalAnswers: Record<string, string>) {
    if (!SUBMIT_ENDPOINT) {
      console.error("NEXT_PUBLIC_SUBMIT_ENDPOINT is not set — candidature not recorded.");
      return;
    }

    try {
      await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "candidature",
          prenom,
          phone,
          email,
          ...finalAnswers,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      // Don't block on a logging failure — the candidate shouldn't be stuck
      // because the sheet write hiccuped.
      console.error("Candidature submission failed:", err);
    }
  }

  function complete(finalAnswers: Record<string, string>) {
    setPhase("booking");
    // Don't block the calendar from showing on the sheet write.
    void submitToSheet(finalAnswers);
  }

  async function reject(finalAnswers: Record<string, string>) {
    await submitToSheet(finalAnswers);
    setPhase("rejected");
  }

  function handleSelect(value: string) {
    const nextAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(nextAnswers);

    // The final engagement question doubles as the eligibility gate — "non"
    // sends the candidate to Instagram instead of Calendly.
    const isRejection = currentStep.id === "engagement" && value === "non";

    if (isRejection) {
      window.setTimeout(() => reject(nextAnswers), SELECT_ADVANCE_DELAY_MS);
    } else if (currentIndex < CANDIDATURE_STEPS.length - 1) {
      window.setTimeout(() => setCurrentIndex((i) => i + 1), SELECT_ADVANCE_DELAY_MS);
    } else {
      window.setTimeout(() => complete(nextAnswers), SELECT_ADVANCE_DELAY_MS);
    }
  }

  function goBack() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  if (phase === "booking") {
    return (
      <div className="ambient-atmosphere relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-page">
        <header className="relative z-[1] flex flex-col items-center gap-1 px-6 pb-2 pt-8 text-center">
          <span className="text-2xl">🗓️</span>
          <h1 className="text-[clamp(1.4rem,5vw,1.8rem)] leading-tight text-white">
            Choisis ton créneau
          </h1>
          <p className="text-[0.8rem] text-muted">Le call dure environ 20 minutes.</p>
        </header>
        <div
          ref={calendlyContainerRef}
          className="calendly-inline-widget relative z-[1]"
          style={{ minWidth: "320px", height: "calc(100dvh - 140px)" }}
        />
        <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
        <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      </div>
    );
  }

  if (phase === "rejected") {
    return (
      <div className="ambient-atmosphere relative isolate flex min-h-[100dvh] flex-col items-center justify-center gap-5 overflow-hidden bg-page px-6 text-center">
        <span className="relative z-[1] text-3xl">🙏</span>
        <h1 className="relative z-[1] text-[clamp(1.8rem,7vw,2.2rem)] leading-[0.95] text-white">
          Ce n&apos;est peut-être pas le bon moment.
        </h1>
        <p className="relative z-[1] max-w-[380px] text-[0.9rem] leading-relaxed text-muted">
          Un accompagnement demande un vrai engagement. En attendant que ce
          soit le bon moment pour toi, continue à progresser avec mon contenu
          au quotidien.
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="press-scale relative z-[1] inline-flex items-center justify-center gap-2 rounded-[var(--r)] bg-gold px-8 py-4 text-[0.75rem] font-extrabold uppercase tracking-[0.2em] text-black transition-transform hover:-translate-y-0.5 hover:bg-gold-hover"
        >
          Suivre @valito.trainer
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Preloaded as soon as the quiz mounts so the widget script/styles are
          already warm by the time the candidate reaches the booking step —
          avoids the multi-second blank wait a cold Calendly load would
          otherwise cause. */}
      <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      <CandidatureShell
        current={currentIndex}
        total={CANDIDATURE_STEPS.length}
        onBack={currentIndex > 0 ? goBack : undefined}
        stepKey={currentStep.id}
      >
        <CandidatureChoiceStep
          title={currentStep.title}
          options={currentStep.options}
          value={answers[currentStep.id]}
          onSelect={handleSelect}
        />
      </CandidatureShell>
    </>
  );
}
