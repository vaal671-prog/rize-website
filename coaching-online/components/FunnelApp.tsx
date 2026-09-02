"use client";

import { useMemo, useState } from "react";
import Hero from "@/components/Hero";
import QuizShell from "@/components/quiz/QuizShell";
import ConfirmationScreen from "@/components/quiz/ConfirmationScreen";
import ChoiceStep from "@/components/quiz/steps/ChoiceStep";
import NumberStep from "@/components/quiz/steps/NumberStep";
import SilhouetteStep from "@/components/quiz/steps/SilhouetteStep";
import GoalStep from "@/components/quiz/steps/GoalStep";
import SliderStep from "@/components/quiz/steps/SliderStep";
import FinalFormStep from "@/components/quiz/steps/FinalFormStep";
import { STEPS, STEPS_REQUIRING_FAT_LOSS } from "@/lib/questionnaire-data";
import { INITIAL_ANSWERS, type Answers } from "@/lib/types";
import { SUBMIT_ENDPOINT } from "@/lib/constants";
import { trackLeadSubmitted, trackQuizStarted } from "@/lib/analytics";

type Phase = "hero" | "quiz" | "confirmation";

const SELECT_ADVANCE_DELAY_MS = 220;

export default function FunnelApp() {
  const [phase, setPhase] = useState<Phase>("hero");
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const visibleSteps = useMemo(
    () =>
      STEPS.filter((step) => {
        if (!STEPS_REQUIRING_FAT_LOSS.includes(step.id)) return true;
        return answers.goal === "perte_gras";
      }),
    [answers.goal],
  );

  const currentStep = visibleSteps[currentIndex];
  const percent = ((currentIndex + 1) / visibleSteps.length) * 100;

  function updateAnswer<K extends keyof Answers>(field: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function goNext() {
    setCurrentIndex((i) => Math.min(visibleSteps.length - 1, i + 1));
  }

  function goBack() {
    if (currentIndex === 0) {
      setPhase("hero");
      return;
    }
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function selectAndAdvance<K extends keyof Answers>(field: K, value: Answers[K]) {
    updateAnswer(field, value);
    window.setTimeout(goNext, SELECT_ADVANCE_DELAY_MS);
  }

  function startQuiz() {
    trackQuizStarted();
    setPhase("quiz");
  }

  async function submitAnswers() {
    setSubmitError(null);

    const payload = {
      age: answers.age,
      heightCm: answers.height,
      weightKg: answers.weight,
      workActivity: answers.workActivity,
      sportLevel: answers.sportLevel,
      frequencyPerWeek: answers.frequency,
      currentSilhouette: answers.currentSilhouette,
      targetSilhouette: answers.targetSilhouette,
      goal: answers.goal,
      kgToLose: answers.kgToLose ?? "",
      pace: answers.pace,
      sleepQuality: answers.sleepQuality,
      stressLevel: answers.stressLevel,
      metabolism: answers.metabolism,
      firstName: answers.firstName,
      email: answers.email,
      whatsapp: answers.whatsapp,
      submittedAt: new Date().toISOString(),
    };

    if (!SUBMIT_ENDPOINT) {
      console.error(
        "NEXT_PUBLIC_SUBMIT_ENDPOINT is not set — submission not sent.",
        payload,
      );
      setSubmitError(
        "Configuration manquante : contacte l'administrateur du site.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        // Google Apps Script Web Apps don't handle CORS preflight requests, so
        // the request must stay a "simple request" — text/plain avoids the
        // browser sending an OPTIONS request first.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Unknown error");

      trackLeadSubmitted();
      setPhase("confirmation");
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError(
        "Une erreur est survenue lors de l'envoi. Réessaie dans quelques instants.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "hero") {
    return <Hero onStart={startQuiz} />;
  }

  if (phase === "confirmation") {
    return <ConfirmationScreen firstName={answers.firstName} />;
  }

  return (
    <QuizShell
      percent={percent}
      onBack={goBack}
      stepKey={currentStep.id}
    >
      {currentStep.type === "choice" ? (
        <ChoiceStep
          title={currentStep.title}
          subtitle={currentStep.subtitle}
          options={currentStep.options}
          value={answers[currentStep.id] as string | undefined}
          onSelect={(value) => selectAndAdvance(currentStep.id, value as never)}
        />
      ) : null}

      {currentStep.type === "number" ? (
        <NumberStep
          title={currentStep.title}
          subtitle={currentStep.subtitle}
          unit={currentStep.unit}
          min={currentStep.min}
          max={currentStep.max}
          step={currentStep.step}
          value={answers[currentStep.id] as number}
          onChange={(value) => updateAnswer(currentStep.id, value as never)}
          onContinue={goNext}
        />
      ) : null}

      {currentStep.type === "silhouette" ? (
        <SilhouetteStep
          title={currentStep.title}
          subtitle={currentStep.subtitle}
          options={currentStep.options}
          value={answers[currentStep.id] as string | undefined}
          onSelect={(value) => selectAndAdvance(currentStep.id, value as never)}
        />
      ) : null}

      {currentStep.type === "goal" ? (
        <GoalStep
          title={currentStep.title}
          subtitle={currentStep.subtitle}
          options={currentStep.options}
          value={answers[currentStep.id] as string | undefined}
          onSelect={(value) => selectAndAdvance(currentStep.id, value as never)}
        />
      ) : null}

      {currentStep.type === "slider" ? (
        <SliderStep
          title={currentStep.title}
          subtitle={currentStep.subtitle}
          minLabel={currentStep.minLabel}
          maxLabel={currentStep.maxLabel}
          emojis={currentStep.emojis}
          nuances={currentStep.nuances}
          value={answers[currentStep.id] as number}
          onChange={(value) => updateAnswer(currentStep.id, value as never)}
          onContinue={goNext}
        />
      ) : null}

      {currentStep.type === "final" ? (
        <FinalFormStep
          title={currentStep.title}
          subtitle={currentStep.subtitle}
          firstName={answers.firstName}
          email={answers.email}
          whatsapp={answers.whatsapp}
          onFieldChange={(field, value) => updateAnswer(field, value as never)}
          onSubmit={submitAnswers}
          submitting={submitting}
          error={submitError}
        />
      ) : null}
    </QuizShell>
  );
}
