export interface CandidatureOption {
  value: string;
  label: string;
  description?: string;
}

export interface CandidatureStep {
  id: string;
  title: string;
  options: CandidatureOption[];
}

/**
 * Qualification questions — reused verbatim (content-wise) from the
 * reference candidature flow you shared, translated into our own step
 * format. Each step's `id` becomes the column header sent to the
 * "Candidatures" sheet tab, so keep ids stable once you're relying on the
 * sheet data.
 */
export const CANDIDATURE_STEPS: CandidatureStep[] = [
  {
    id: "profession",
    title: "Quelle est ta situation professionnelle ?",
    options: [
      { value: "salarie", label: "Salarié" },
      { value: "cadre_manager", label: "Cadre / Manager" },
      { value: "profession_liberale", label: "Profession libérale" },
      { value: "entrepreneur", label: "Entrepreneur" },
      { value: "dirigeant", label: "Dirigeant" },
      { value: "retraite", label: "Retraité" },
      { value: "etudiant", label: "Étudiant" },
      { value: "sans_emploi", label: "Sans emploi" },
    ],
  },
  {
    id: "duree",
    title: "Depuis combien de temps cherches-tu à te transformer durablement ?",
    options: [
      {
        value: "moins_6_mois",
        label: "Moins de 6 mois",
        description: "Je commence à me prendre en main",
      },
      {
        value: "6_mois_1_an",
        label: "6 mois à 1 an",
        description: "J'ai commencé à chercher des solutions",
      },
      {
        value: "1_3_ans",
        label: "1 à 3 ans",
        description: "Je stagne malgré mes efforts",
      },
      {
        value: "plus_3_ans",
        label: "Plus de 3 ans",
        description: "J'ai essayé beaucoup de choses sans résultats durables",
      },
    ],
  },
  {
    id: "blocage",
    title: "Qu'est-ce qui t'a principalement bloqué jusqu'ici ?",
    options: [
      {
        value: "methode",
        label: "Le manque de méthode claire",
        description: "Trop d'informations contradictoires",
      },
      {
        value: "discipline",
        label: "La discipline au quotidien",
        description: "Difficile de tenir sur la durée sans suivi",
      },
      {
        value: "temps",
        label: "Le manque de temps",
        description: "Entre le boulot et la vie perso, difficile de prioriser",
      },
      {
        value: "suivi",
        label: "Pas de vrai suivi personnalisé",
        description: "Des plans génériques qui ne s'adaptent pas",
      },
      {
        value: "tout",
        label: "Tout à la fois",
        description: "C'est un ensemble de facteurs",
      },
    ],
  },
  {
    id: "changement",
    title:
      "Qu'est-ce que tu es prêt à changer concrètement dans tes habitudes pour atteindre ton objectif ?",
    options: [
      {
        value: "alimentation",
        label: "Mon alimentation au quotidien",
        description: "Ce que je mange, les quantités, les horaires",
      },
      {
        value: "activite",
        label: "Mon niveau d'activité physique",
        description: "Ma fréquence d'entraînement, mon intensité",
      },
      {
        value: "mental",
        label: "Mon état d'esprit et ma discipline mentale",
        description: "Mes habitudes, ma constance, mon rapport à l'effort",
      },
      {
        value: "tout",
        label: "Tout ça à la fois",
        description: "Je suis prêt à revoir l'ensemble de mes habitudes",
      },
    ],
  },
  {
    id: "declencheur",
    title: "Qu'est-ce qui t'a décidé à agir maintenant ?",
    options: [
      {
        value: "stagnation",
        label: "J'en ai assez de stagner malgré mes efforts",
        description: "Ça fait trop longtemps que ça ne bouge pas",
      },
      {
        value: "evenement",
        label: "Un événement récent m'a motivé",
        description: "Une photo, un voyage, une rencontre, un déclic…",
      },
      {
        value: "sante",
        label: "Je ressens des effets sur ma santé ou mon énergie",
        description: "Fatigue, souffle court, inconfort au quotidien",
      },
      {
        value: "anticipation",
        label: "Je veux changer avant que ça devienne encore plus difficile",
        description: "Mieux vaut agir maintenant que regretter plus tard",
      },
    ],
  },
  {
    id: "engagement",
    title:
      "Si on trouve ensemble la bonne approche pour toi, es-tu prêt à t'investir pleinement dans un accompagnement ?",
    options: [
      {
        value: "oui",
        label: "Oui, je suis prêt à faire les efforts et à m'y tenir",
        description: "Je veux des résultats durables, pas une solution rapide",
      },
      {
        value: "non",
        label: "Non, je cherche quelque chose sans trop d'efforts",
        description: "Ce n'est peut-être pas le bon timing pour moi",
      },
    ],
  },
];
