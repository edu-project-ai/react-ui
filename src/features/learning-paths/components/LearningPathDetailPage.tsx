import { memo, useState as useStateReact } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useGetLearningPathByIdQuery, useUpdateLearningPathStatusMutation } from "../api/learningPathsApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import type { CheckpointPreview } from "../services/type";
import { ProgressBar } from "./ProgressBar";
import { CheckpointTimelineItem } from "./CheckpointTimelineItem";

const BackArrowIcon = memo(() => (
  <svg
    className="w-4 h-4 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
));
BackArrowIcon.displayName = "BackArrowIcon";



const SpinnerIcon = memo(({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
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

const GeneratingBadge = memo(() => (
  <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold uppercase tracking-wide rounded-full animate-pulse">
    <SpinnerIcon className="w-4 h-4 mr-2" />
    Generating
  </span>
));
GeneratingBadge.displayName = "GeneratingBadge";

/**
 * Full-page generating state indicator
 */
const GeneratingState = memo(() => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700 p-12">
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
        <SpinnerIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">
        Your Roadmap is Being Generated
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Our AI is crafting a personalized learning path just for you. 
        This usually takes 1-2 minutes. Please check back shortly!
      </p>
      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
        <SpinnerIcon className="w-4 h-4" />
        <span>Processing your preferences...</span>
      </div>
    </div>
  </div>
));
GeneratingState.displayName = "GeneratingState";

const LoadingState = memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
  </div>
));
LoadingState.displayName = "LoadingState";

interface ErrorStateProps {
  message?: string;
}

const ErrorState = memo(({ message = "Failed to load learning path. Please try again later." }: ErrorStateProps) => (
  <div className="container mx-auto px-4 py-8">
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p className="text-destructive">{message}</p>
    </div>
    <Link
      to="/learning-paths"
      className="inline-block mt-4 text-primary hover:text-primary/80"
    >
      ← Back to Learning Paths
    </Link>
  </div>
));
ErrorState.displayName = "ErrorState";

interface StatsCardProps {
  difficultyLevel: string;
  estimatedDays?: number;
  checkpointCount: number;
}

const StatsCard = memo(({ difficultyLevel, estimatedDays, checkpointCount }: StatsCardProps) => (
  <div className="flex-shrink-0 bg-muted/50 rounded-xl p-4 border border-border min-w-[200px]">
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Difficulty</span>
        <span className="font-semibold text-foreground capitalize">
          {difficultyLevel}
        </span>
      </div>
      {estimatedDays && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Estimated</span>
          <span className="font-semibold text-foreground">
            {estimatedDays} days
          </span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Checkpoints</span>
        <span className="font-semibold text-foreground">{checkpointCount}</span>
      </div>
    </div>
  </div>
));
StatsCard.displayName = "StatsCard";

const ActiveBadge = memo(({ isActive }: { isActive?: boolean }) => {
  if (!isActive) return null;
  return (
    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wide rounded-full">
      Active
    </span>
  );
});
ActiveBadge.displayName = "ActiveBadge";

interface LearningPathHeaderProps {
  title: string;
  description: string;
  isActive?: boolean;
  isCompleted: boolean;
  isGenerating?: boolean;
  difficultyLevel: string;
  estimatedDays?: number;
  checkpointCount: number;
  progress?: {
    percentage: number;
    completedTasks: number;
    totalTasks: number;
  };
}

const LearningPathHeader = memo(({
  title,
  description,
  isActive,
  isCompleted,
  isGenerating,
  difficultyLevel,
  estimatedDays,
  checkpointCount,
  progress,
}: LearningPathHeaderProps) => {
  // Determine card styling based on state
  const getCardClassName = () => {
    const baseClasses = "rounded-2xl shadow-sm border overflow-hidden";
    
    if (isGenerating) {
      return `${baseClasses} bg-blue-50/30 dark:bg-blue-900/10 border-blue-300 dark:border-blue-800`;
    }
    
    if (isCompleted) {
      return `${baseClasses} bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-900/30`;
    }
    
    return `${baseClasses} bg-card border-border`;
  };

  return (
    <div className={getCardClassName()}>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {isGenerating && <GeneratingBadge />}
              {!isGenerating && <ActiveBadge isActive={isActive} />}
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <StatsCard
            difficultyLevel={difficultyLevel}
            estimatedDays={estimatedDays}
            checkpointCount={checkpointCount}
          />
        </div>

        {/* Hide progress when generating (would show NaN%) */}
        {progress && !isGenerating && (
          <div>
            <ProgressBar
              percentage={progress.percentage}
              isCompleted={isCompleted}
              size="lg"
              showLabel
              label="Overall Progress"
            />
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {progress.completedTasks} of {progress.totalTasks} tasks completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
LearningPathHeader.displayName = "LearningPathHeader";

interface CheckpointsTimelineProps {
  checkpoints: CheckpointPreview[];
  learningPathId: string;
}

const CheckpointsTimeline = memo(({ checkpoints, learningPathId }: CheckpointsTimelineProps) => {
  if (checkpoints.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 text-center border border-dashed border-border">
        <p className="text-muted-foreground text-lg">
          No checkpoints available for this learning path.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {checkpoints.map((checkpoint, index) => (
        <CheckpointTimelineItem
          key={checkpoint.id || `cp-${index}`}
          checkpoint={checkpoint}
          index={index}
          learningPathId={learningPathId}
        />
      ))}
    </div>
  );
});
CheckpointsTimeline.displayName = "CheckpointsTimeline";

export const LearningPathDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: learningPath,
    isLoading,
    error,
  } = useGetLearningPathByIdQuery(id!);
  const [updateStatus, { isLoading: isDeactivating }] = useUpdateLearningPathStatusMutation();
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useStateReact(false);

  const handleDeactivate = async () => {
    if (!id) return;
    try {
      await updateStatus({ id, isActive: false }).unwrap();
      navigate("/learning-paths");
    } catch {
      // error handled by RTK Query
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !learningPath) {
    return <ErrorState />;
  }

  const isCompleted =
    learningPath.progress && learningPath.progress.percentage >= 100;
  
  // Check if the learning path is still being generated
  const isGenerating = ["pending", "processing", "generating"].includes(
    learningPath.generationStatus || ""
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Link */}
      <div className="mb-10">
        <Link
          to="/learning-paths"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <BackArrowIcon />
          Back to Learning Paths
        </Link>

        <LearningPathHeader
          title={learningPath.title}
          description={learningPath.description || ""}
          isActive={learningPath.isActive}
          isCompleted={!!isCompleted}
          isGenerating={isGenerating}
          difficultyLevel={learningPath.difficultyLevel}
          estimatedDays={learningPath.estimatedDays ?? undefined}
          checkpointCount={learningPath.checkpoints.length}
          progress={learningPath.progress}
        />

        {/* Deactivate Roadmap */}
        {learningPath.isActive && !isGenerating && (
          <div className="mt-4">
            {showDeactivateConfirm ? (
              <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-sm text-foreground flex-1">
                  Are you sure you want to deactivate this roadmap? It will be hidden from all pages.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeactivate}
                  disabled={isDeactivating}
                >
                  {isDeactivating ? "Deactivating..." : "Confirm"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeactivateConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeactivateConfirm(true)}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Deactivate Roadmap
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Checkpoints Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-8">Your Roadmap</h2>
        {isGenerating ? (
          <GeneratingState />
        ) : (
          <CheckpointsTimeline
            checkpoints={learningPath.checkpoints}
            learningPathId={id!}
          />
        )}
      </div>
    </div>
  );
};
