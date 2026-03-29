import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import FormInput from "@/components/form/FormInput";
import FormCheckbox from "@/components/form/FormCheckbox";
import { VisualCardGroup } from "../VisualCardGroup";
import type { CardOption } from "../VisualCardGroup";
import type { CreateLearningPathRequest } from "../../services/type";
import { MultiSelect } from "@/components/ui/multi-select";

const LEARNING_STYLE_OPTIONS: CardOption[] = [
  {
    value: "hands-on",
    label: "Hands-on (Projects)",
    description: "Learn by building real things from day one",
    icon: "🛠️",
  },
  {
    value: "theory-first",
    label: "Theory First",
    description: "Understand the concepts before applying them",
    icon: "📚",
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "Equal balance of theory and hands-on practice",
    icon: "⚖️",
  },
];

const PREFERRED_RESOURCES_OPTIONS = [
  { label: "Official Documentation", value: "Official Documentation" },
  { label: "Video Courses", value: "Video Courses" },
  { label: "Interactive Labs", value: "Interactive Labs" },
  { label: "Books", value: "Books" },
  { label: "Blogs & Tutorials", value: "Blogs & Tutorials" },
  { label: "GitHub Projects", value: "GitHub Projects" },
  { label: "Online Courses", value: "Online Courses" },
  { label: "Podcasts", value: "Podcasts" },
];

interface Step3CustomizeProps {
  control: Control<CreateLearningPathRequest>;
  setValue: UseFormSetValue<CreateLearningPathRequest>;
  watch: UseFormWatch<CreateLearningPathRequest>;
}

export const Step3Customize = ({ control, setValue, watch }: Step3CustomizeProps) => {
  const learningStyle = watch("learningStyle");
  const preferredResources = watch("preferredResources");

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-6">
      {/* Pace & timeline */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FormInput
          name="weeklyHours"
          label="Hours per Week"
          type="number"
          control={control}
          rules={{
            required: "Hours per week is required",
            min: { value: 1, message: "At least 1 hour per week" },
            max: { value: 168, message: "Max 168 hours per week" },
            validate: (v: unknown) => Number.isInteger(Number(v)) || "Must be a whole number",
          }}
        />
        <FormInput
          name="timelineMonths"
          label="Timeline (Months)"
          type="number"
          control={control}
          rules={{
            required: "Timeline is required",
            min: { value: 1, message: "At least 1 month" },
            max: { value: 24, message: "Max 24 months" },
            validate: (v: unknown) => Number.isInteger(Number(v)) || "Must be a whole number",
          }}
        />
      </div>

      {/* Learning style */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground block">
          Preferred Learning Style
        </label>
        <VisualCardGroup
          options={LEARNING_STYLE_OPTIONS}
          value={learningStyle}
          onChange={(v) => setValue("learningStyle", v)}
        />
      </div>

      {/* Resources */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          Preferred Resources
        </label>
        <MultiSelect
          options={PREFERRED_RESOURCES_OPTIONS}
          defaultValue={preferredResources ?? []}
          onValueChange={(vals) => setValue("preferredResources", vals)}
          placeholder="Select resource types..."
          maxCount={4}
        />
      </div>

      {/* Roadmap structure */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Roadmap Structure</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control how many checkpoints and items the AI generates
          </p>
        </div>

        <FormInput
          name="numberOfCheckpoints"
          label="Number of Checkpoints"
          type="number"
          control={control}
          rules={{
            required: "Number of checkpoints is required",
            min: { value: 3, message: "At least 3 checkpoints" },
            max: { value: 15, message: "Max 15 checkpoints" },
            validate: (v: unknown) => Number.isInteger(Number(v)) || "Must be a whole number",
          }}
        />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Items per checkpoint
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <FormInput
              name="theoryItemsPerCheckpoint"
              label="Theory"
              type="number"
              control={control}
              rules={{
                required: "Required",
                min: { value: 1, message: "Min 1" },
                max: { value: 10, message: "Max 10" },
                validate: (v: unknown) => Number.isInteger(Number(v)) || "Whole number",
              }}
            />
            <FormInput
              name="codeItemsPerCheckpoint"
              label="Code Tasks"
              type="number"
              control={control}
              rules={{
                required: "Required",
                min: { value: 1, message: "Min 1" },
                max: { value: 8, message: "Max 8" },
                validate: (v: unknown) => Number.isInteger(Number(v)) || "Whole number",
              }}
            />
            <FormInput
              name="quizItemsPerCheckpoint"
              label="Quizzes"
              type="number"
              control={control}
              rules={{
                required: "Required",
                min: { value: 1, message: "Min 1" },
                max: { value: 5, message: "Max 5" },
                validate: (v: unknown) => Number.isInteger(Number(v)) || "Whole number",
              }}
            />
          </div>
        </div>
      </div>

      <FormCheckbox
        name="includeCapstone"
        label="Include a Capstone Project at the end"
        control={control}
      />
    </div>
  );
};
