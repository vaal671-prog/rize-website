import type { StepConfig } from "@/lib/types";

/**
 * Full ordered list of steps. The "kgToLose" step is filtered out at runtime
 * by FunnelApp when goal !== "perte_gras" — see STEPS_REQUIRING_FAT_LOSS.
 */
export const STEPS: StepConfig[] = [
  {
    id: "age",
    type: "choice",
    title: "Quel âge as-tu ?",
    options: [
      { value: "18-24", label: "18 – 24 ans" },
      { value: "25-34", label: "25 – 34 ans" },
      { value: "35-44", label: "35 – 44 ans" },
      { value: "45-54", label: "45 – 54 ans" },
      { value: "55+", label: "55 ans et +" },
    ],
    columns: 1,
  },
  {
    id: "height",
    type: "number",
    title: "Quelle est ta taille ?",
    unit: "cm",
    min: 140,
    max: 220,
    step: 1,
  },
  {
    id: "weight",
    type: "number",
    title: "Quel est ton poids actuel ?",
    unit: "kg",
    min: 35,
    max: 200,
    step: 1,
  },
  {
    id: "workActivity",
    type: "choice",
    title: "Quel est ton niveau d'activité au travail ?",
    options: [
      {
        value: "sedentaire",
        label: "Sédentaire",
        description: "Assis la majorité de la journée (bureau, télétravail).",
      },
      {
        value: "modere",
        label: "Modérément actif",
        description: "Debout ou en mouvement une bonne partie de la journée.",
      },
      {
        value: "tres_actif",
        label: "Très actif",
        description: "Travail physique, marche ou port de charges toute la journée.",
      },
    ],
    columns: 1,
  },
  {
    id: "sportLevel",
    type: "choice",
    title: "Quel est ton niveau de pratique sportive ?",
    options: [
      {
        value: "debutant",
        label: "Débutant",
        description: "Tu débutes ou tu reprends le sport après une longue pause.",
      },
      {
        value: "intermediaire",
        label: "Intermédiaire",
        description: "Tu t'entraînes régulièrement depuis plusieurs mois.",
      },
      {
        value: "confirme",
        label: "Confirmé",
        description: "Tu t'entraînes depuis plusieurs années avec une bonne maîtrise technique.",
      },
    ],
    columns: 1,
  },
  {
    id: "frequency",
    type: "choice",
    title: "Combien de séances par semaine souhaites-tu ?",
    options: [
      {
        value: "3",
        label: "3 séances / semaine",
        description: "Idéal pour progresser sans bouleverser ton emploi du temps.",
      },
      {
        value: "4",
        label: "4 séances / semaine",
        description: "Le bon compromis entre progression et récupération.",
      },
      {
        value: "5",
        label: "5 séances / semaine",
        description: "Pour progresser vite, si ton emploi du temps le permet.",
      },
    ],
    columns: 1,
  },
  {
    id: "currentSilhouette",
    type: "silhouette",
    title: "Quelle silhouette te ressemble le plus aujourd'hui ?",
    options: [
      { value: "skinny", label: "Skinny", image: "/images/silhouettes/silhouette-actuelle-skinny.jpg" },
      { value: "skinny-fat", label: "Skinny fat", image: "/images/silhouettes/silhouette-actuelle-skinny-fat.jpg" },
      { value: "athletique", label: "Athlétique", image: "/images/silhouettes/silhouette-actuelle-athletique.jpg" },
      { value: "legerement-enrobe", label: "Légèrement enrobé", image: "/images/silhouettes/silhouette-actuelle-legerement-enrobe.jpg" },
      { value: "enrobe", label: "Enrobé", image: "/images/silhouettes/silhouette-actuelle-enrobe.jpg" },
      { value: "tres-enrobe", label: "Très enrobé", image: "/images/silhouettes/silhouette-actuelle-tres-enrobe.jpg" },
    ],
  },
  {
    id: "targetSilhouette",
    type: "silhouette",
    title: "Quelle silhouette veux-tu atteindre ?",
    options: [
      { value: "massif", label: "Massif", image: "/images/silhouettes/silhouette-cible-massif.jpg" },
      { value: "athletique", label: "Athlétique", image: "/images/silhouettes/silhouette-cible-athletique.jpg" },
      { value: "fit", label: "Fit", image: "/images/silhouettes/silhouette-cible-fit.jpg" },
      { value: "sec", label: "Sec", image: "/images/silhouettes/silhouette-cible-sec.jpg" },
    ],
  },
  {
    id: "goal",
    type: "goal",
    title: "Quel est ton objectif principal ?",
    options: [
      {
        value: "perte_gras",
        label: "Perdre du gras",
        description: "Réduire ta masse grasse tout en préservant ton muscle.",
      },
      {
        value: "prise_muscle",
        label: "Prendre du muscle",
        description: "Développer du muscle et de la force, prendre du volume.",
      },
    ],
  },
  {
    id: "kgToLose",
    type: "choice",
    title: "Combien de kilos veux-tu perdre ?",
    options: [
      { value: "1-5", label: "1 à 5 kg" },
      { value: "6-14", label: "6 à 14 kg" },
      { value: "15+", label: "15 kg et +" },
    ],
    columns: 1,
  },
  {
    id: "pace",
    type: "choice",
    title: "À quelle vitesse veux-tu progresser ?",
    options: [
      {
        value: "lente",
        label: "Perte lente",
        description: "-10% calories — résultats progressifs, meilleure adhérence sur la durée.",
      },
      {
        value: "moderee",
        label: "Perte modérée",
        description: "-15% calories — bon compromis entre vitesse et confort au quotidien.",
      },
      {
        value: "rapide",
        label: "Perte rapide",
        description: "-20% calories — résultats plus rapides, demande plus de rigueur.",
      },
    ],
    columns: 1,
  },
  {
    id: "sleepQuality",
    type: "slider",
    title: "Comment évalues-tu la qualité de ton sommeil ?",
    minLabel: "Mauvais",
    maxLabel: "Excellent",
    emojis: ["😩", "😕", "😐", "🙂", "😴"],
    nuances: ["Très mauvais", "Insuffisant", "Correct", "Bon", "Excellent"],
  },
  {
    id: "stressLevel",
    type: "slider",
    title: "Quel est ton niveau de stress au quotidien ?",
    minLabel: "Très stressé",
    maxLabel: "Pas stressé",
    emojis: ["😰", "😟", "😐", "🙂", "😌"],
    nuances: ["Très stressé", "Stressé", "Modéré", "Plutôt calme", "Zen"],
  },
  {
    id: "metabolism",
    type: "slider",
    title: "Comment perçois-tu ton métabolisme ?",
    minLabel: "Lent",
    maxLabel: "Rapide",
    emojis: ["🐢", "🚶", "🏃", "⚡", "🔥"],
    nuances: ["Lent", "Plutôt lent", "Normal", "Rapide", "Très rapide"],
  },
  {
    id: "final",
    type: "final",
    title: "Dernière étape !",
    subtitle: "Où dois-je t'envoyer ta consultation personnalisée ?",
  },
];

/** Step ids only relevant when the user picked "Perdre du gras". */
export const STEPS_REQUIRING_FAT_LOSS: Array<StepConfig["id"]> = ["kgToLose"];
