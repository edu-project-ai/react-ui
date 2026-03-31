import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OnboardingLayout } from "@/components/layout/OnboardingLayout/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useAppSelector } from "@/hooks/useReduxHooks";
import { TechSkillsSelect } from "@/components/shared/TechSkillsSelect";
import {
  TECHNOLOGY_TO_BACKEND_MAP,
  type Technology,
} from "./constants";
import { useOnboarding } from "./hooks/useOnboarding";

export const TechnologiesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    technologies: savedTechnologies,
    skillLevel,
    loading,
    setTechnologies: saveTechnologies,
    clearData,
    complete,
  } = useOnboarding();

  const currentUser = useAppSelector((state) => state.user?.currentUser);

  const [selectedTechs, setSelectedTechs] = useState<Technology[]>(savedTechnologies);

  const photoFile = (location.state as { photoFile?: File })?.photoFile;

  useEffect(() => {
    if (savedTechnologies.length > 0) {
      setSelectedTechs(savedTechnologies);
    }
  }, [savedTechnologies]);

  const handleFinish = async () => {
    if (selectedTechs.length === 0) {
      toast.error("Please select at least one technology");
      return;
    }

    saveTechnologies(selectedTechs);

    try {
      const attributes = await fetchUserAttributes();

      const firstName = (attributes.given_name || currentUser?.firstName || "").trim();
      const lastName = (attributes.family_name || currentUser?.lastName || "").trim();
      const displayName = (
        attributes.name ||
        currentUser?.displayName ||
        `${firstName} ${lastName}`.trim()
      ).trim();

      if (!firstName || !displayName) {
        throw new Error("Missing required user information");
      }

      const profileResult = await complete({
        firstName,
        lastName,
        displayName,
        photoFile: photoFile || null,
        programmingLevel: (skillLevel || "Beginner").toLowerCase(),
        programmingTechnologies: selectedTechs.map(
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
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={3}
      title="Choose your technologies"
      description="Select the technologies you're interested in or already working with"
    >
      <div className="space-y-6">
        <TechSkillsSelect value={selectedTechs} onChange={setSelectedTechs} />

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => navigate("/onboarding/skill-level")}
            className="flex-1"
            type="button"
          >
            ← Back
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex-1"
            type="button"
          >
            Skip
          </Button>
          <Button
            variant="default"
            onClick={handleFinish}
            disabled={selectedTechs.length === 0 || loading}
            className="flex-1"
            type="button"
          >
            {loading ? (
              <LoadingSpinner text="Creating profile..." />
            ) : (
              "Finish setup"
            )}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default TechnologiesPage;
