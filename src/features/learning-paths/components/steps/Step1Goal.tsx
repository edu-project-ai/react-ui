import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import FormInput from "@/components/form/FormInput";
import FormTextarea from "@/components/form/FormTextarea";
import { VisualCardGroup } from "../VisualCardGroup";
import type { CardOption } from "../VisualCardGroup";
import type { CreateLearningPathRequest } from "../../services/type";

const CAREER_OBJECTIVE_OPTIONS: CardOption[] = [
  {
    value: "career_change",
    label: "Career Change",
    description: "Pivoting to a new field or role",
    icon: "🚀",
  },
  {
    value: "skill_upgrade",
    label: "Skill Upgrade",
    description: "Deepening expertise in your current career",
    icon: "📈",
  },
  {
    value: "hobby",
    label: "Hobby / Personal Interest",
    description: "Learning for fun or personal projects",
    icon: "🎯",
  },
];

interface Step1GoalProps {
  control: Control<CreateLearningPathRequest>;
  setValue: UseFormSetValue<CreateLearningPathRequest>;
  watch: UseFormWatch<CreateLearningPathRequest>;
}

export const Step1Goal = ({ control, setValue, watch }: Step1GoalProps) => {
  const careerObjective = watch("careerObjective");

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-6">
      <FormInput
        name="targetRole"
        label="Target Role *"
        control={control}
        rules={{
          required: "Target role is required",
          validate: (v: unknown) => String(v).trim().length > 0 || "Target role cannot be empty",
        }}
        placeholder="e.g. Junior DevOps Engineer, Frontend Developer"
      />

      <FormTextarea
        name="specificFocus"
        label="Specific Focus Areas *"
        control={control}
        rules={{
          required: "Specific focus is required",
          validate: (v: unknown) => String(v).trim().length > 0 || "Specific focus cannot be empty",
        }}
        placeholder="e.g. Linux Administration, AWS, Docker, Kubernetes"
        rows={3}
      />

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground block">
          What's your motivation?
        </label>
        <VisualCardGroup
          options={CAREER_OBJECTIVE_OPTIONS}
          value={careerObjective}
          onChange={(v) => setValue("careerObjective", v)}
        />
      </div>
    </div>
  );
};
