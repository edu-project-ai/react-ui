import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TechSkillsSelect } from "@/components/shared/TechSkillsSelect";
import type { Technology } from "../constants";
import type { WizardState } from "../OnboardingWizard";

interface TechnologiesStepProps {
  state: WizardState;
  onUpdate: (updates: Partial<WizardState>) => void;
  onBack: () => void;
  onFinish: () => void;
  loading: boolean;
}

export const TechnologiesStep = ({
  state,
  onUpdate,
  onBack,
  onFinish,
  loading,
}: TechnologiesStepProps) => {
  const handleChange = (techs: Technology[]) => {
    onUpdate({ technologies: techs });
  };

  return (
    <div className="space-y-6">
      <TechSkillsSelect value={state.technologies} onChange={handleChange} />

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
          type="button"
        >
          ← Back
        </Button>
        <Button
          variant="default"
          onClick={onFinish}
          disabled={state.technologies.length === 0 || loading}
          className="flex-1"
          type="button"
        >
          {loading ? <LoadingSpinner text="Creating profile..." /> : "Finish setup"}
        </Button>
      </div>
    </div>
  );
};
