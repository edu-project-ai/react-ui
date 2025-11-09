import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OnboardingLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { SKILL_LEVELS, type SkillLevel } from "./constants";
import { useOnboarding } from "./hooks/useOnboarding";

const SKILL_DESCRIPTIONS: Record<SkillLevel, string> = {
  Beginner: "Just starting out or learning the basics",
  Intermediate: "Comfortable with fundamentals and building projects",
  Advanced: "Experienced professional or expert in the field",
};

const SKILL_ICONS: Record<SkillLevel, string> = {
  Beginner: "🌱",
  Intermediate: "🚀",
  Advanced: "⭐",
};

export const SkillLevelPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { skillLevel: savedSkillLevel, setSkillLevel: saveSkillLevel } =
    useOnboarding();
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(
    savedSkillLevel
  );

  // Get photo file from navigation state (passed from ProfilePhotoPage)
  const photoFile = (location.state as { photoFile?: File })?.photoFile;

  // Restore from Redux
  useEffect(() => {
    if (savedSkillLevel) {
      setSelectedLevel(savedSkillLevel);
    }
  }, [savedSkillLevel]);

  const handleNext = () => {
    if (!selectedLevel) return;
    saveSkillLevel(selectedLevel);
    // Pass photo file forward
    navigate("/onboarding/technologies", {
      state: { photoFile },
    });
  };

  const handleBack = () => {
    navigate("/onboarding/profile-photo");
  };

  const handleSkip = () => {
    // Pass photo file forward even when skipping
    navigate("/onboarding/technologies", {
      state: { photoFile },
    });
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={3}
      title="What's your skill level?"
      description="Help us tailor your experience to match your expertise"
    >
      <div className="space-y-6">
        {/* Skill level options */}
        <div className="space-y-3">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left",
                "hover:border-primary/50 hover:bg-primary/5",
                selectedLevel === level
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
                    selectedLevel === level ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  {SKILL_ICONS[level]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={cn(
                        "font-semibold",
                        selectedLevel === level
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {level}
                    </h3>
                    {selectedLevel === level && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {SKILL_DESCRIPTIONS[level]}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1"
            type="button"
          >
            ← Back
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="flex-1"
            type="button"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!selectedLevel}
            className="flex-1"
            type="button"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default SkillLevelPage;
