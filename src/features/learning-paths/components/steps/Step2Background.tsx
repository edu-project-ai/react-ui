import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import FormInput from "@/components/form/FormInput";
import { VisualCardGroup } from "../VisualCardGroup";
import type { CardOption } from "../VisualCardGroup";
import type { CreateLearningPathRequest } from "../../services/type";
import { MultiSelect } from "@/components/ui/multi-select";
import { TECHNOLOGIES, TECHNOLOGY_OPTIONS_GROUPED, type Technology } from "@/features/onboarding";

const VALID_TECH_SET = new Set<string>(TECHNOLOGIES);

function toTechArray(values: string[]): string[] {
  return values.filter((v) => VALID_TECH_SET.has(v));
}

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
  const knownTechnologies = watch("knownTechnologies");
  const avoidTechnologies = watch("avoidTechnologies");

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
        rules={{
          required: "Please describe your experience",
          validate: (v: unknown) => String(v).trim().length > 0 || "Experience cannot be empty",
        }}
        placeholder="e.g. 2 years as QA Engineer, self-taught JavaScript developer"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          Known Technologies
        </label>
        <MultiSelect
          options={TECHNOLOGY_OPTIONS_GROUPED}
          defaultValue={toTechArray(knownTechnologies ?? [])}
          onValueChange={(vals) => setValue("knownTechnologies", vals as Technology[])}
          placeholder="Select technologies you know..."
          maxCount={6}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          Technologies to Avoid{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <MultiSelect
          options={TECHNOLOGY_OPTIONS_GROUPED}
          defaultValue={toTechArray(avoidTechnologies ?? [])}
          onValueChange={(vals) => setValue("avoidTechnologies", vals as Technology[])}
          placeholder="Select technologies to avoid..."
          maxCount={6}
        />
      </div>
    </div>
  );
};
