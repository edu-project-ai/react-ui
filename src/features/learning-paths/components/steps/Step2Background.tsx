import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import FormInput from "@/components/form/FormInput";
import FormArrayInput from "@/components/form/FormArrayInput";
import { VisualCardGroup } from "../VisualCardGroup";
import type { CardOption } from "../VisualCardGroup";
import type { CreateLearningPathRequest } from "../../services/type";

const USER_LEVEL_OPTIONS: CardOption[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Little to no experience in this area",
    icon: "🌱",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Comfortable with basics, building proficiency",
    icon: "⚡",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Strong foundation, targeting mastery",
    icon: "🏆",
  },
];

interface Step2BackgroundProps {
  control: Control<CreateLearningPathRequest>;
  setValue: UseFormSetValue<CreateLearningPathRequest>;
  watch: UseFormWatch<CreateLearningPathRequest>;
}

export const Step2Background = ({ control, setValue, watch }: Step2BackgroundProps) => {
  const userLevel = watch("userLevel");

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground block">
          Current Experience Level
        </label>
        <VisualCardGroup
          options={USER_LEVEL_OPTIONS}
          value={userLevel}
          onChange={(v) => setValue("userLevel", v)}
        />
      </div>

      <FormInput
        name="experience"
        label="Describe Your Experience *"
        control={control}
        rules={{ required: "Please describe your experience" }}
        placeholder="e.g. 2 years as QA Engineer, self-taught JavaScript developer"
      />

      <FormArrayInput
        name="knownTechnologies"
        label="Known Technologies (comma separated)"
        control={control}
        placeholder="HTML, CSS, JavaScript, Python…"
      />

      <FormArrayInput
        name="avoidTechnologies"
        label="Technologies to Avoid (comma separated, optional)"
        control={control}
        placeholder="Azure, GCP, Jenkins…"
      />
    </div>
  );
};
