export type Goal = "perte_gras" | "prise_muscle";

export interface Answers {
  age?: string;
  height: number;
  weight: number;
  workActivity?: string;
  sportLevel?: string;
  frequency?: string;
  currentSilhouette?: string;
  targetSilhouette?: string;
  goal?: Goal;
  kgToLose?: string;
  pace?: string;
  sleepQuality: number;
  stressLevel: number;
  metabolism: number;
  firstName: string;
  email: string;
  whatsapp: string;
  consent: boolean;
}

export const INITIAL_ANSWERS: Answers = {
  age: undefined,
  height: 175,
  weight: 75,
  workActivity: undefined,
  sportLevel: undefined,
  frequency: undefined,
  currentSilhouette: undefined,
  targetSilhouette: undefined,
  goal: undefined,
  kgToLose: undefined,
  pace: undefined,
  sleepQuality: 50,
  stressLevel: 50,
  metabolism: 50,
  firstName: "",
  email: "",
  whatsapp: "",
  consent: false,
};

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
}

export interface SilhouetteOption {
  value: string;
  label: string;
  image: string;
}

export type StepConfig =
  | {
      id: keyof Answers;
      type: "choice";
      title: string;
      subtitle?: string;
      options: ChoiceOption[];
      columns?: 1 | 2 | 3;
    }
  | {
      id: keyof Answers;
      type: "number";
      title: string;
      subtitle?: string;
      unit: string;
      min: number;
      max: number;
      step: number;
    }
  | {
      id: keyof Answers;
      type: "silhouette";
      title: string;
      subtitle?: string;
      options: SilhouetteOption[];
    }
  | {
      id: keyof Answers;
      type: "goal";
      title: string;
      subtitle?: string;
      options: ChoiceOption[];
    }
  | {
      id: keyof Answers;
      type: "slider";
      title: string;
      subtitle?: string;
      minLabel: string;
      maxLabel: string;
      emojis: string[];
      /** Same length as emojis — describes the nuance of each emoji step. */
      nuances: string[];
    }
  | {
      id: "final";
      type: "final";
      title: string;
      subtitle?: string;
    };
