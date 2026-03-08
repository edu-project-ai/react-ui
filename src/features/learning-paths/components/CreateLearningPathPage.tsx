import { useState, memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useReduxHooks";
import { useLearningPaths } from "../hooks/useLearningPaths";
import { Spinner } from "@/components/ui/spinner";
import { Form } from "@/components/ui/form";
import {
  TECHNOLOGY_LABELS,
  BACKEND_TO_TECHNOLOGY_MAP,
  type Technology,
} from "@/features/onboarding";
import type { CreateLearningPathRequest } from "../services/type";
import { Step1Goal } from "./steps/Step1Goal";
import { Step2Background } from "./steps/Step2Background";
import { Step3Customize } from "./steps/Step3Customize";

// ============================================================================
// Step Progress Bar
// ============================================================================

interface StepProgressProps {
  currentStep: number;
  stepLabels: string[];
  stepDescriptions: string[];
  onStepClick?: (step: number) => void;
}

const StepProgress = memo(
  ({ currentStep, stepLabels, stepDescriptions, onStepClick }: StepProgressProps) => {
    const total = stepLabels.length;
    return (
      <div className="mb-8">
        {/* Step dots + labels */}
        <div className="flex items-start">
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            const isClickable = isDone || isActive;
            return (
              <div key={idx} className="flex items-start flex-1 last:flex-none">
                <div className="flex flex-col items-center min-w-0">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onStepClick?.(stepNum)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-300 ${
                      isDone
                        ? "bg-primary text-primary-foreground cursor-pointer hover:ring-4 hover:ring-primary/20"
                        : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 cursor-default"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {isDone ? "✓" : stepNum}
                  </button>
                  <span
                    className={`text-xs font-medium mt-1.5 text-center hidden sm:block max-w-[80px] leading-tight ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < total - 1 && (
                  <div
                    className={`flex-1 h-0.5 mt-4 mx-2 transition-all duration-500 ${
                      stepNum < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Active step description */}
        <div className="mt-6 p-4 bg-muted/40 rounded-xl border border-border/50">
          <p className="text-sm font-semibold text-foreground">
            Step {currentStep} of {total}: {stepLabels[currentStep - 1]}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stepDescriptions[currentStep - 1]}
          </p>
        </div>
      </div>
    );
  }
);
StepProgress.displayName = "StepProgress";

// ============================================================================
// Main Page Component
// ============================================================================

const STEP_LABELS = ["Your Goal", "Background", "Customize"];
const STEP_DESCRIPTIONS = [
  "Tell us what role you're aiming for and what drives you.",
  "Share your current experience so we can tailor the difficulty.",
  "Fine-tune the structure, pace, and content format of your roadmap.",
];

export const CreateLearningPathPage = () => {
  const navigate = useNavigate();
  const { skillLevel, technologies } = useAppSelector((state) => state.onboarding);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const { createLearningPath, isCreating } = useLearningPaths();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Derive level: onboarding state has priority (fresh wizard), fallback to saved profile
  const derivedLevel =
    (skillLevel?.toLowerCase() as string | null) ||
    currentUser?.programmingLevel ||
    "beginner";

  // Derive known technologies as Technology keys; onboarding state has priority
  const derivedTechnologies: Technology[] =
    technologies.length > 0
      ? [...technologies]
      : (currentUser?.programmingTechnologies ?? [])
          .map((slug) => BACKEND_TO_TECHNOLOGY_MAP[slug])
          .filter((t): t is Technology => t !== undefined);

  const derivedExperience = currentUser
    ? `I am a ${currentUser.programmingLevel} developer with experience in ${
        derivedTechnologies.map((t) => TECHNOLOGY_LABELS[t] || t).join(", ")
      }.`
    : "";

  const methods = useForm<CreateLearningPathRequest>({
    mode: "onChange",
    defaultValues: {
      // Step 1
      targetRole: "",
      specificFocus: "",
      careerObjective: "career_change",
      // Step 2
      userLevel: derivedLevel,
      experience: derivedExperience,
      knownTechnologies: derivedTechnologies,
      avoidTechnologies: [],
      // Step 3
      weeklyHours: 10,
      timelineMonths: 6,
      learningStyle: "hands-on",
      preferredResources: ["Official Documentation", "Interactive Labs"],
      numberOfCheckpoints: 8,
      theoryItemsPerCheckpoint: 4,
      codeItemsPerCheckpoint: 2,
      quizItemsPerCheckpoint: 1,
      includeCapstone: true,
      // Hidden
      generationMode: "hierarchical",
      testResults: null,
    },
  });

  const { handleSubmit, control, trigger, setValue, watch } = methods;

  const handleStepClick = useCallback(async (targetStep: number) => {
    if (targetStep >= step) return; // Only allow going back
    setStep(targetStep);
  }, [step]);

  const handleCancel = useCallback(() => navigate("/learning-paths"), [navigate]);

  const handleNext = async () => {
    const fieldsToValidate =
      step === 1
        ? (["targetRole", "specificFocus"] as const)
        : (["experience"] as const);
    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: CreateLearningPathRequest) => {
    // Safety guard: the form can only be submitted on the last step.
    // Prevents browser Enter-key behaviour from firing the request mid-wizard.
    if (step !== 3) return;
    setError(null);
    const result = await createLearningPath(data);
    if (result.success) {
      navigate("/learning-paths");
    } else {
      setError(result.error || "Failed to create learning path. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Create New Roadmap</h1>
        <p className="text-muted-foreground">
          Answer a few questions and we'll generate a personalized learning path just for you.
        </p>
      </div>

      <StepProgress
        currentStep={step}
        stepLabels={STEP_LABELS}
        stepDescriptions={STEP_DESCRIPTIONS}
        onStepClick={handleStepClick}
      />

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      <Form {...methods}>
        <form
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            // Prevent Enter key from submitting the form on any step
            if (e.key === "Enter") e.preventDefault();
          }}
        >
          {/* ─────────────── Step 1: Your Goal ─────────────── */}
          {step === 1 && (
            <Step1Goal control={control} setValue={setValue} watch={watch} />
          )}

          {/* ─────────────── Step 2: Your Background ─────────────── */}
          {step === 2 && (
            <Step2Background control={control} setValue={setValue} watch={watch} />
          )}

          {/* ─────────────── Step 3: Customize ─────────────── */}
          {step === 3 && (
            <Step3Customize control={control} setValue={setValue} watch={watch} />
          )}

          {/* ─────────────── Navigation ─────────────── */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  ← Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isCreating}
                  className="px-6 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating && <Spinner size="sm" />}
                  Generate Roadmap
                </button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
