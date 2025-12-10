import { useState, memo, useCallback } from "react";
import { useForm, type Control } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useReduxHooks";
import { useLearningPaths } from "../hooks";
import { Spinner } from "@/components/ui";
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormArrayInput,
  type SelectOption,
} from "@/components/form";
import { TECHNOLOGY_LABELS } from "@/features/onboarding/constants";
import type { CreateLearningPathRequest } from "../services/type";

// ============================================================================
// Constants - Options for select fields
// ============================================================================

const CAREER_OBJECTIVE_OPTIONS: SelectOption[] = [
  { value: "career_change", label: "Career Change" },
  { value: "skill_upgrade", label: "Skill Upgrade" },
  { value: "hobby", label: "Hobby / Personal Interest" },
];

const USER_LEVEL_OPTIONS: SelectOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LEARNING_STYLE_OPTIONS: SelectOption[] = [
  { value: "hands-on", label: "Hands-on (Projects)" },
  { value: "theory-first", label: "Theory First (Reading/Lectures)" },
  { value: "mixed", label: "Mixed" },
];

// ============================================================================
// Form Section Components - Memoized to prevent unnecessary re-renders
// ============================================================================

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection = memo(({ title, children }: FormSectionProps) => (
  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
    <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
    <div className="grid gap-6">{children}</div>
  </div>
));
FormSection.displayName = "FormSection";

// ============================================================================
// Target Role & Focus Section
// ============================================================================

interface TargetRoleSectionProps {
  control: Control<CreateLearningPathRequest>;
}

const TargetRoleSection = memo(({ control }: TargetRoleSectionProps) => (
  <FormSection title="Target Role & Focus">
    <FormInput
      name="target_role"
      label="Target Role *"
      control={control}
      rules={{ required: "Target role is required" }}
      placeholder="e.g. Junior DevOps Engineer"
    />

    <FormTextarea
      name="specific_focus"
      label="Specific Focus Areas *"
      control={control}
      rules={{ required: "Specific focus is required" }}
      placeholder="e.g. Linux Administration, AWS, Docker, Kubernetes"
      rows={3}
    />

    <FormSelect
      name="career_objective"
      label="Career Objective"
      control={control}
      options={CAREER_OBJECTIVE_OPTIONS}
    />
  </FormSection>
));
TargetRoleSection.displayName = "TargetRoleSection";

// ============================================================================
// Experience & Skills Section
// ============================================================================

interface ExperienceSectionProps {
  control: Control<CreateLearningPathRequest>;
}

const ExperienceSection = memo(({ control }: ExperienceSectionProps) => (
  <FormSection title="Experience & Skills">
    <div className="grid md:grid-cols-2 gap-6">
      <FormSelect
        name="user_level"
        label="Current Level"
        control={control}
        options={USER_LEVEL_OPTIONS}
      />

      <FormInput
        name="experience"
        label="Experience Description"
        control={control}
        placeholder="e.g. 2 years as QA Engineer"
      />
    </div>

    <FormArrayInput
      name="known_technologies"
      label="Known Technologies (comma separated)"
      control={control}
      placeholder="HTML, CSS, JavaScript"
    />

    <FormArrayInput
      name="avoid_technologies"
      label="Technologies to Avoid (comma separated)"
      control={control}
      placeholder="Azure, GCP, Jenkins"
    />
  </FormSection>
));
ExperienceSection.displayName = "ExperienceSection";

// ============================================================================
// Preferences & Settings Section
// ============================================================================

interface PreferencesSectionProps {
  control: Control<CreateLearningPathRequest>;
}

const PreferencesSection = memo(({ control }: PreferencesSectionProps) => (
  <FormSection title="Preferences & Settings">
    <div className="grid md:grid-cols-2 gap-6">
      <FormInput
        name="weekly_hours"
        label="Weekly Hours"
        type="number"
        control={control}
        rules={{ min: 1, max: 168 }}
      />

      <FormInput
        name="timeline_months"
        label="Timeline (Months)"
        type="number"
        control={control}
        rules={{ min: 1, max: 24 }}
      />
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <FormSelect
        name="learning_style"
        label="Learning Style"
        control={control}
        options={LEARNING_STYLE_OPTIONS}
      />

      <FormArrayInput
        name="preferred_resources"
        label="Preferred Resources (comma separated)"
        control={control}
        placeholder="Official Docs, Video Courses"
      />
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <FormInput
        name="number_of_checkpoints"
        label="Number of Checkpoints"
        type="number"
        control={control}
        rules={{ min: 3, max: 15 }}
      />

      <FormInput
        name="tasks_per_checkpoint"
        label="Tasks per Checkpoint"
        type="number"
        control={control}
        rules={{ min: 3, max: 12 }}
      />
    </div>

    <FormCheckbox
      name="include_capstone"
      label="Include Capstone Project"
      control={control}
    />
  </FormSection>
));
PreferencesSection.displayName = "PreferencesSection";

// ============================================================================
// Error Alert Component
// ============================================================================

interface ErrorAlertProps {
  message: string | null;
}

const ErrorAlert = memo(({ message }: ErrorAlertProps) => {
  if (!message) return null;

  return (
    <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
      {message}
    </div>
  );
});
ErrorAlert.displayName = "ErrorAlert";

// ============================================================================
// Form Actions Component
// ============================================================================

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const FormActions = memo(({ isSubmitting, onCancel }: FormActionsProps) => (
  <div className="flex justify-end gap-4">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    >
      {isSubmitting && <Spinner size="sm" className="mr-2" />}
      Generate Roadmap
    </button>
  </div>
));
FormActions.displayName = "FormActions";

// ============================================================================
// Main Page Component
// ============================================================================

export const CreateLearningPathPage = () => {
  const navigate = useNavigate();
  const { skillLevel, technologies } = useAppSelector(
    (state) => state.onboarding
  );
  const { createLearningPath, isCreating } = useLearningPaths();
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, control } = useForm<CreateLearningPathRequest>({
    defaultValues: {
      user_level: skillLevel || "beginner",
      experience: "",
      known_technologies: technologies.map((t) => TECHNOLOGY_LABELS[t] || t),
      weekly_hours: 10,
      learning_style: "hands-on",
      target_role: "",
      specific_focus: "",
      timeline_months: 6,
      career_objective: "career_change",
      number_of_checkpoints: 8,
      tasks_per_checkpoint: 4,
      include_capstone: true,
      generation_mode: "full",
      test_results: null,
      avoid_technologies: [],
      preferred_resources: ["Official Documentation", "Interactive Labs"],
    },
  });

  const handleCancel = useCallback(() => {
    navigate("/learning-paths");
  }, [navigate]);

  const onSubmit = async (data: CreateLearningPathRequest) => {
    setError(null);

    const result = await createLearningPath(data);
    if (result.success) {
      navigate("/learning-paths");
    } else {
      setError(result.error || "Failed to create learning path. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create New Learning Path
        </h1>
        <p className="text-muted-foreground">
          Define your goals and preferences to generate a personalized roadmap.
        </p>
      </div>

      <ErrorAlert message={error} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <TargetRoleSection control={control} />
        <ExperienceSection control={control} />
        <PreferencesSection control={control} />
        <FormActions isSubmitting={isCreating} onCancel={handleCancel} />
      </form>
    </div>
  );
};
