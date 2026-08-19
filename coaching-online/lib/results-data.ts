const AGE_LABELS: Record<string, string> = {
  "18-24": "18 – 24 ans",
  "25-34": "25 – 34 ans",
  "35-44": "35 – 44 ans",
  "45-54": "45 – 54 ans",
  "55+": "55 ans et +",
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentaire: "Sédentaire",
  modere: "Modérément actif",
  moderement: "Modérément actif",
  tres_actif: "Très actif",
};

const NIVEAU_LABELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  confirme: "Confirmé",
};

const OBJECTIF_LABELS: Record<string, string> = {
  perte_gras: "Perdre du gras",
  prise_muscle: "Prendre du muscle",
};

const APPROCHE_LABELS: Record<string, string> = {
  lente: "Perte lente",
  moderee: "Perte modérée",
  rapide: "Perte rapide",
};

const SILHOUETTE_CURRENT_LABELS: Record<string, string> = {
  skinny: "Skinny",
  "skinny-fat": "Skinny fat",
  athletique: "Athlétique",
  "legerement-enrobe": "Légèrement enrobé",
  enrobe: "Enrobé",
  "tres-enrobe": "Très enrobé",
};

const SILHOUETTE_TARGET_LABELS: Record<string, string> = {
  massif: "Massif",
  athletique: "Athlétique",
  fit: "Fit",
  sec: "Sec",
};

function label(dict: Record<string, string>, value: string | null, fallback = "—") {
  if (!value) return fallback;
  return dict[value] ?? value;
}

export function ageLabel(value: string | null) {
  return label(AGE_LABELS, value);
}

export function activityLabel(value: string | null) {
  return label(ACTIVITY_LABELS, value);
}

export function niveauLabel(value: string | null) {
  return label(NIVEAU_LABELS, value);
}

export function objectifLabel(value: string | null) {
  return label(OBJECTIF_LABELS, value);
}

export function approcheLabel(value: string | null) {
  return label(APPROCHE_LABELS, value);
}

export function silhouetteCurrentLabel(value: string | null) {
  return label(SILHOUETTE_CURRENT_LABELS, value);
}

export function silhouetteTargetLabel(value: string | null) {
  return label(SILHOUETTE_TARGET_LABELS, value);
}

export function silhouetteCurrentImage(value: string | null) {
  return value ? `/images/silhouettes/silhouette-actuelle-${value}.jpg` : null;
}

export function silhouetteTargetImage(value: string | null) {
  return value ? `/images/silhouettes/silhouette-cible-${value}.jpg` : null;
}

/** goalKg may arrive as a raw code ("1-5") or an already-formatted string ("1-5 kg"). */
export function kgLabel(value: string | null) {
  if (!value) return "—";
  return /[a-zA-Z]/.test(value) ? value : `${value} kg`;
}

export function seancesLabel(value: string | null) {
  if (!value) return "—";
  return `${value} séances/sem`;
}

interface ContactInfo {
  prenom: string;
  phone: string | null;
  email: string | null;
}

/**
 * Appends the prospect's contact info to a destination URL (internal route
 * or external link, e.g. Calendly) so it can pre-fill instead of asking
 * again. No-ops on placeholder/fragment-only hrefs (e.g. "#calendly-a-venir")
 * since those aren't a real destination yet. Works with both absolute URLs
 * (https://...) and internal relative paths (/candidature).
 */
export function buildBookingUrl(baseUrl: string, contact: ContactInfo) {
  if (baseUrl.startsWith("#")) return baseUrl;

  const isAbsolute = baseUrl.startsWith("http");
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const url = new URL(baseUrl, isAbsolute ? undefined : origin);

  url.searchParams.set("src", "auto");
  if (contact.prenom) url.searchParams.set("prenom", contact.prenom);
  if (contact.phone) url.searchParams.set("phone", contact.phone);
  if (contact.email) url.searchParams.set("email", contact.email);

  // External destinations (Calendly, etc.) use their own prefill contract —
  // Calendly specifically reads ?name= and ?email=, not ?prenom=.
  if (isAbsolute && contact.prenom) url.searchParams.set("name", contact.prenom);

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
}
