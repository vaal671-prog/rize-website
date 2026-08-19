import type { Metadata } from "next";
import { Suspense } from "react";
import ResultsPageClient from "@/components/results/ResultsPageClient";

export const metadata: Metadata = {
  title: "Ton Bilan Personnalisé | VD Performance",
  description: "Ton bilan et ta consultation personnalisée, générés à partir de tes réponses.",
};

export default function ResultatsPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-page" />}>
      <ResultsPageClient />
    </Suspense>
  );
}
