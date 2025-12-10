import { memo } from "react";
import { Link } from "react-router-dom";
import type { LearningPath } from "../services/type";
import { ProgressBar } from "./ProgressBar";

/**
 * Helper to extract status from planJson
 */
const getPlanStatus = (planJson?: Record<string, unknown> | null): string | null => {
  if (!planJson) return null;
  const status = planJson.Status ?? planJson.status;
  return typeof status === "string" ? status : null;
};

const LightningIcon = memo(() => (
  <svg
    className="w-4 h-4 mr-2 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
));
LightningIcon.displayName = "LightningIcon";

const ClockIcon = memo(() => (
  <svg
    className="w-4 h-4 mr-2 text-muted-foreground"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
));
ClockIcon.displayName = "ClockIcon";

const SpinnerIcon = memo(() => (
  <svg
    className="w-3 h-3 mr-1.5 animate-spin"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));
SpinnerIcon.displayName = "SpinnerIcon";

interface GeneratingBadgeProps {
  isGenerating: boolean;
}

const GeneratingBadge = memo(({ isGenerating }: GeneratingBadgeProps) => {
  if (!isGenerating) return null;

  return (
    <span className="ml-3 inline-flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide rounded-full animate-pulse">
      <SpinnerIcon />
      Generating
    </span>
  );
});
GeneratingBadge.displayName = "GeneratingBadge";

interface ActiveBadgeProps {
  isActive?: boolean;
}

const ActiveBadge = memo(({ isActive }: ActiveBadgeProps) => {
  if (!isActive) return null;

  return (
    <span className="ml-3 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wide rounded-full">
      Active
    </span>
  );
});
ActiveBadge.displayName = "ActiveBadge";

interface CardHeaderProps {
  title: string;
  description: string;
  isActive?: boolean;
  isGenerating?: boolean;
}

const CardHeader = memo(({ title, description, isActive, isGenerating }: CardHeaderProps) => (
  <div className="flex items-start justify-between mb-4">
    <div className="flex-1">
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
        {description}
      </p>
    </div>
    <div className="flex flex-col gap-2">
      <GeneratingBadge isGenerating={!!isGenerating} />
      <ActiveBadge isActive={isActive} />
    </div>
  </div>
));
CardHeader.displayName = "CardHeader";

interface CardMetadataProps {
  difficultyLevel: string;
  estimatedDays?: number;
}

const CardMetadata = memo(
  ({ difficultyLevel, estimatedDays }: CardMetadataProps) => (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="flex items-center text-sm text-muted-foreground">
        <LightningIcon />
        <span className="capitalize">{difficultyLevel}</span>
      </div>
      {estimatedDays && (
        <div className="flex items-center text-sm text-muted-foreground">
          <ClockIcon />
          <span>{estimatedDays} days</span>
        </div>
      )}
    </div>
  )
);
CardMetadata.displayName = "CardMetadata";

interface CardProgressProps {
  percentage: number;
  isCompleted: boolean;
}

const CardProgress = memo(({ percentage, isCompleted }: CardProgressProps) => (
  <ProgressBar
    percentage={percentage}
    isCompleted={isCompleted}
    size="sm"
    showLabel
    label="Progress"
  />
));
CardProgress.displayName = "CardProgress";

interface LearningPathCardProps {
  path: LearningPath;
}

/**
 * A card component for displaying a learning path summary.
 * Memoized with extracted sub-components to optimize re-renders.
 * Shows a generating indicator for learning paths that are being generated.
 */
export const LearningPathCard = memo(({ path }: LearningPathCardProps) => {
  const isCompleted = path.progress && path.progress.percentage >= 100;
  const progressPercentage = path.progress?.percentage ?? 0;
  const planStatus = getPlanStatus(path.planJson);
  const isGenerating = planStatus === "generating";

  // Determine card styling based on state
  const getCardClassName = () => {
    const baseClasses = "group flex flex-col rounded-2xl shadow-sm transition-all duration-300 border overflow-hidden";
    
    if (isGenerating) {
      return `${baseClasses} bg-blue-50/30 dark:bg-blue-900/10 border-blue-300 dark:border-blue-800 cursor-wait`;
    }
    
    if (isCompleted) {
      return `${baseClasses} hover:shadow-xl transform hover:-translate-y-1 bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-900/30`;
    }
    
    return `${baseClasses} hover:shadow-xl transform hover:-translate-y-1 bg-card border-border`;
  };

  const cardContent = (
    <div className="p-6 flex-1 flex flex-col">
      <CardHeader
        title={path.title}
        description={path.description}
        isActive={path.isActive}
        isGenerating={isGenerating}
      />

      <div className="mt-auto pt-4 border-t border-border">
        <CardMetadata
          difficultyLevel={path.difficultyLevel}
          estimatedDays={path.estimatedDays}
        />

        {path.progress && !isGenerating && (
          <CardProgress
            percentage={progressPercentage}
            isCompleted={!!isCompleted}
          />
        )}

        {isGenerating && (
          <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
            <SpinnerIcon />
            <span>Your roadmap is being created...</span>
          </div>
        )}
      </div>
    </div>
  );

  // Don't navigate to the path if it's still generating
  if (isGenerating) {
    return (
      <div className={getCardClassName()}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      to={`/learning-paths/${path.id}`}
      className={getCardClassName()}
    >
      {cardContent}
    </Link>
  );
});

LearningPathCard.displayName = "LearningPathCard";
