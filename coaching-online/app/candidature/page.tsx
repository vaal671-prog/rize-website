import type { Metadata } from "next";
import { Suspense } from "react";
import CandidaturePageClient from "@/components/candidature/CandidaturePageClient";

export const metadata: Metadata = {
  title: "Ta Candidature | VD Performance",
  description: "Quelques questions avant de réserver ton appel.",
};

export default function CandidaturePage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-page" />}>
      <CandidaturePageClient />
    </Suspense>
  );
}
