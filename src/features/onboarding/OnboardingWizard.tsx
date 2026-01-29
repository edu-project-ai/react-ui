import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchUserAttributes } from "aws-amplify/auth";
import { OnboardingLayout } from "@/components/layout/OnboardingLayout/OnboardingLayout";
import { useAppSelector } from "@/hooks/useReduxHooks";

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
  
  // Отримуємо currentUser з Redux (вже має правильний email з JWT токена)
  const currentUser = useAppSelector((state) => state.user?.currentUser);
  
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
      // Отримуємо атрибути з Cognito для firstName, lastName, displayName
      const attributes = await fetchUserAttributes();

      // Використовуємо currentUser з Redux як fallback
      // Це особливо важливо для Google OAuth, де атрибути можуть бути відсутні
      const firstName = (attributes.given_name || currentUser?.firstName || "").trim();
      const lastName = (attributes.family_name || currentUser?.lastName || "").trim();
      const displayName = (attributes.name || currentUser?.displayName || `${firstName} ${lastName}`.trim()).trim();

      if (!firstName || !displayName) {
        throw new Error("Missing required user information");
      }

      const profileResult = await complete({
        firstName,
        lastName,
        displayName,
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
  }, [wizardState, complete, clearData, navigate, currentUser]);

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
