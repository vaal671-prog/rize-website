"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AnimatedCursor from "@/components/results/AnimatedCursor";
import ResultsPoster from "@/components/results/ResultsPoster";
import FinalCta from "@/components/results/FinalCta";
import {
  activityLabel,
  ageLabel,
  approcheLabel,
  kgLabel,
  niveauLabel,
  objectifLabel,
  seancesLabel,
  silhouetteCurrentImage,
  silhouetteCurrentLabel,
  silhouetteTargetImage,
  silhouetteTargetLabel,
} from "@/lib/results-data";

function toNumber(value: string | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export default function ResultsPageClient() {
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Tapping anywhere on the card unmutes — the coach's video is the whole
  // point of this page, so the "tap to unmute" affordance shouldn't be
  // limited to the small bubble itself.
  function unmuteFromCard() {
    if (!muted) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    video.play().catch(() => {});
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) video.play().catch(() => {});
  }

  const prenom = searchParams.get("prenom") ?? "";
  const age = searchParams.get("age");
  const silhouette = searchParams.get("silhouette");
  const goalSilhouette = searchParams.get("goalSilhouette");
  const niveau = searchParams.get("niveau");
  const activity = searchParams.get("activity");
  const seances = searchParams.get("seances");
  const taille = searchParams.get("taille");
  const poids = searchParams.get("poids");
  const objectif = searchParams.get("objectif");
  const goalKg = searchParams.get("goalKg");
  const approche = searchParams.get("approche");
  // Played directly in a native <video> element (see VideoBubble), so this
  // must be a direct, playable file URL — not a Google Drive preview link
  // (Drive's iframe can't be muted/autoplayed/looped programmatically).
  const videoUrl = searchParams.get("videoUrl");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");

  const calories = toNumber(searchParams.get("calories"));
  const maintenance = toNumber(searchParams.get("maintenance"));
  const proteines = toNumber(searchParams.get("proteines"));
  const glucides = toNumber(searchParams.get("glucides"));
  const lipides = toNumber(searchParams.get("lipides"));
  const sommeil = toNumber(searchParams.get("sommeil")) ?? 0;
  const stress = toNumber(searchParams.get("stress")) ?? 0;
  const metabolisme = toNumber(searchParams.get("metabolisme")) ?? 0;

  // Order matters here: it drives both the reading order on screen and the
  // path the ambient cursor animation walks through (see AnimatedCursor),
  // matched to the order a coach naturally narrates the profile out loud.
  const profileStats = [
    { id: "age", label: "Âge", value: ageLabel(age) },
    { id: "poids", label: "Poids", value: poids ? `${poids} kg` : "—" },
    { id: "taille", label: "Taille", value: taille ? `${taille} cm` : "—" },
    { id: "activite", label: "Activité", value: activityLabel(activity) },
    { id: "niveau", label: "Niveau", value: niveauLabel(niveau) },
    {
      id: "objectif",
      label: "Objectif",
      value:
        objectif === "perte_gras"
          ? `${objectifLabel(objectif)} (${kgLabel(goalKg)})`
          : objectifLabel(objectif),
    },
    { id: "vitesse", label: "Vitesse", value: approcheLabel(approche) },
    { id: "frequence", label: "Fréquence", value: seancesLabel(seances) },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#c8c6c0] sm:p-6">
      {/* Fixed phone-card width — this is a WhatsApp link opened on a phone,
          so on wider screens (desktop testing, etc.) we still show exactly
          the mobile layout instead of letting it stretch full-width.
          Height is natural (min-h floor only) instead of clipped to one
          screen — content that's taller than the viewport just scrolls the
          page normally, instead of being squeezed into an inner scrollbox. */}
      <div
        onClick={unmuteFromCard}
        onTouchEnd={unmuteFromCard}
        className="relative flex min-h-[100dvh] w-full max-w-[430px] cursor-pointer flex-col bg-[#f2f1ee] px-4 pb-4 pt-3 shadow-2xl sm:my-6 sm:min-h-0 sm:rounded-[2.5rem]"
      >
        <div>
          <ResultsPoster
            prenom={prenom}
            stats={profileStats}
            currentImage={silhouetteCurrentImage(silhouette)}
            currentLabel={silhouetteCurrentLabel(silhouette)}
            targetImage={silhouetteTargetImage(goalSilhouette)}
            targetLabel={silhouetteTargetLabel(goalSilhouette)}
            sommeil={sommeil}
            stress={stress}
            metabolisme={metabolisme}
            calories={calories}
            maintenance={maintenance}
            proteines={proteines}
            glucides={glucides}
            lipides={lipides}
            videoUrl={videoUrl}
            videoRef={videoRef}
            muted={muted}
            onToggleMute={toggleMute}
          />
        </div>

        <div className="mt-auto flex items-center justify-center pt-4">
          <FinalCta prenom={prenom} phone={phone} email={email} />
        </div>

        <AnimatedCursor />
      </div>
    </div>
  );
}
