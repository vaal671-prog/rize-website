import type { Metadata } from "next";
import { Suspense } from "react";
import ResultsPageClient from "@/components/results/ResultsPageClient";

export const metadata: Metadata = {
  title: "Ton Bilan Personnalisé | VD Performance",
  description: "Ton bilan et ta consultation personnalisée, générés à partir de tes réponses.",
};

// Same host every result video is already served from — not a secret, it's
// visible in plain sight inside every videoUrl. Short profile blobs
// (?id=<slug>) live alongside the videos at data/<slug>.json.
const R2_PUBLIC_BASE = "https://pub-59008e378e0a4f568f6b5c3841233637.r2.dev";

async function fetchResultsData(id: string): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(`${R2_PUBLIC_BASE}/data/${id}.json`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, string>;
  } catch {
    return null;
  }
}

export default async function ResultatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : null;
  const data = id ? await fetchResultsData(id) : null;

  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-page" />}>
      <ResultsPageClient data={data} />
    </Suspense>
  );
}
