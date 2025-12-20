import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchUserAttributes } from "aws-amplify/auth";
import { OnboardingLayout } from "@/components/layout";

import { PhotoStep } from "./steps/PhotoStep";
import { SkillLevelStep } from "./steps/SkillLevelStep";
import { TechnologiesStep } from "./steps/TechnologiesStep";
import { useOnboarding } from "./hooks/useOnboarding";
import { TECHNOLOGY_TO_BACKEND_MAP, type SkillLevel, type Technology } from "./constants";

export interface WizardState {
  photoPreview: string | null;
  photoFile: File | null;
  skillLevel: SkillLevel | null;
  technologies: Technology[];
}

const STEPS = [
  { id: 1, title: "Add your profile photo", description: "Help others recognize you by adding a photo. You can always change it later." },
  { id: 2, title: "What's your skill level?", description: "Help us tailor your experience to match your expertise" },
  { id: 3, title: "Choose your technologies", description: "Select the technologies you're interested in or already working with" },
] as const;

export const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { complete, clearData, loading } = useOnboarding();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({
    photoPreview: null,
    photoFile: null,
    skillLevel: null,
    technologies: [],
  });

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleFinish = useCallback(async () => {
    if (wizardState.technologies.length === 0) {
      toast.error("Please select at least one technology");
      return;
    }

    try {
      const attributes = await fetchUserAttributes();

      if (!attributes.email || !attributes.given_name || !attributes.family_name || !attributes.name) {
        throw new Error("Missing required user attributes");
      }

      const profileResult = await complete({
        firstName: attributes.given_name,
        lastName: attributes.family_name,
        displayName: attributes.name,
        photoFile: wizardState.photoFile,
        programmingLevel: (wizardState.skillLevel || "Beginner").toLowerCase(),
        programmingTechnologies: wizardState.technologies.map(
          (tech) => TECHNOLOGY_TO_BACKEND_MAP[tech]
        ),
      });

      if (profileResult.success) {
        clearData();
        navigate("/dashboard", {
          replace: true,
          state: { profileCreated: true },
        });
      }
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast.error("Failed to complete setup. Please try again.");
    }
  }, [wizardState, complete, clearData, navigate]);

  const stepConfig = STEPS[currentStep - 1];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhotoStep
            state={wizardState}
            onUpdate={updateState}
            onNext={goToNextStep}
            onSkip={goToNextStep}
          />
        );
      case 2:
        return (
          <SkillLevelStep
            state={wizardState}
            onUpdate={updateState}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSkip={goToNextStep}
          />
        );
      case 3:
        return (
          <TechnologiesStep
            state={wizardState}
            onUpdate={updateState}
            onBack={goToPreviousStep}
            onFinish={handleFinish}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={STEPS.length}
      title={stepConfig.title}
      description={stepConfig.description}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default OnboardingWizard;
