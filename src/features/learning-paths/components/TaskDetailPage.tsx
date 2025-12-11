import { useState, memo, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGetCheckpointQuery } from "../api";
import { useLearningPaths } from "../hooks";
import { Spinner } from "@/components/ui";
import type { Task } from "../services/type";

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

const CheckIcon = memo(() => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
));
CheckIcon.displayName = "CheckIcon";

const XIcon = memo(() => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
));
XIcon.displayName = "XIcon";

const ClockIcon = memo(() => (
  <svg
    className="w-3 h-3 mr-1"
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

const ResourcesIcon = memo(() => (
  <svg
    className="w-5 h-5 mr-2 text-primary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
));
ResourcesIcon.displayName = "ResourcesIcon";

const LoadingState = memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
  </div>
));
LoadingState.displayName = "LoadingState";

interface ErrorStateProps {
  onGoBack: () => void;
}

const ErrorState = memo(({ onGoBack }: ErrorStateProps) => (
  <div className="container mx-auto px-4 py-8">
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p className="text-destructive">
        Failed to load task details. Please try again later.
      </p>
    </div>
    <button
      onClick={onGoBack}
      className="inline-block mt-4 text-primary hover:text-primary/80"
    >
      ← Back to Checkpoint
    </button>
  </div>
));
ErrorState.displayName = "ErrorState";

interface TaskMetadataBadgesProps {
  type?: string;
  estimatedTime?: number;
  difficulty?: string | null;
  language?: string | null;
}

const TaskMetadataBadges = memo(({
  type,
  estimatedTime,
  difficulty,
  language,
}: TaskMetadataBadgesProps) => (
  <div className="flex flex-wrap gap-3 text-sm">
    {type && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        {type}
      </span>
    )}
    {estimatedTime !== undefined && estimatedTime > 0 && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
        <ClockIcon />
        {estimatedTime} min
      </span>
    )}
    {difficulty && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 capitalize">
        {difficulty}
      </span>
    )}
    {language && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        {language}
      </span>
    )}
  </div>
));
TaskMetadataBadges.displayName = "TaskMetadataBadges";

interface CompletionStatusBadgeProps {
  isCompleted: boolean;
}

const CompletionStatusBadge = memo(({ isCompleted }: CompletionStatusBadgeProps) => (
  <div className="ml-4 flex-shrink-0">
    {isCompleted ? (
      <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full">
        <CheckIcon />
        Completed
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
        In Progress
      </span>
    )}
  </div>
));
CompletionStatusBadge.displayName = "CompletionStatusBadge";

interface CompletionButtonProps {
  isCompleted: boolean;
  isUpdating: boolean;
  onClick: () => void;
}

const CompletionButton = memo(({
  isCompleted,
  isUpdating,
  onClick,
}: CompletionButtonProps) => (
  <button
    onClick={onClick}
    disabled={isUpdating}
    className={`w-full md:w-auto min-w-[200px] py-3 px-6 rounded-lg font-medium transition-all transform active:scale-95 ${
      isCompleted
        ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
  >
    {isUpdating ? (
      <>
        <Spinner size="sm" className="mr-2" />
        Updating...
      </>
    ) : isCompleted ? (
      <>
        <XIcon />
        Mark as Incomplete
      </>
    ) : (
      <>
        <CheckIcon />
        Mark as Completed
      </>
    )}
  </button>
));
CompletionButton.displayName = "CompletionButton";

interface TaskHeaderProps {
  title: string;
  checkpointTitle?: string;
  task: Task;
}

const TaskHeader = memo(({ title, checkpointTitle, task }: TaskHeaderProps) => (
  <>
    {checkpointTitle && (
      <p className="text-sm text-muted-foreground mb-2 font-medium">
        {checkpointTitle}
      </p>
    )}

    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
            <TaskMetadataBadges
              type={task.type}
              estimatedTime={task.estimatedTime}
              difficulty={task.difficulty}
              language={task.language}
            />
          </div>
          <CompletionStatusBadge isCompleted={task.completed} />
        </div>
      </div>
    </div>
  </>
));
TaskHeader.displayName = "TaskHeader";

interface ResourcesSectionProps {
  resources: Record<string, unknown>;
}

const ResourcesSection = memo(({ resources }: ResourcesSectionProps) => {
  if (!resources || Object.keys(resources).length === 0) return null;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
          <ResourcesIcon />
          Resources
        </h2>
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <pre className="text-sm text-muted-foreground overflow-x-auto font-mono">
            {JSON.stringify(resources, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
});
ResourcesSection.displayName = "ResourcesSection";

export const TaskDetailPage = () => {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { checkpointId, realCheckpointId, checkpointTitle } =
    (location.state as {
      checkpointId?: string;
      realCheckpointId?: string;
      checkpointTitle?: string;
    }) || {};

  const [isUpdating, setIsUpdating] = useState(false);
  const { toggleTaskCompletion } = useLearningPaths();

  const {
    data: checkpoint,
    isLoading,
    error,
  } = useGetCheckpointQuery(
    {
      learningPathId: id!,
      checkpointId: checkpointId!,
    },
    { skip: !checkpointId }
  );

  const task = checkpoint?.tasks.find((t: Task) => t.id === taskId);

  const handleGoBack = useCallback(() => {
    if (checkpointId) {
      navigate(`/learning-paths/${id}/checkpoints/${checkpointId}`);
    } else {
      navigate(`/learning-paths/${id}`);
    }
  }, [checkpointId, id, navigate]);

  const handleToggleCompletion = useCallback(async () => {
    if (!task || !checkpointId) return;

    setIsUpdating(true);
    try {
      const apiCheckpointId = realCheckpointId || checkpointId;

      await toggleTaskCompletion({
        learningPathId: id!,
        checkpointId: apiCheckpointId,
        taskId: task.id,
        completed: !task.completed,
        cacheCheckpointId: checkpointId,
      });
    } finally {
      setIsUpdating(false);
    }
  }, [task, checkpointId, realCheckpointId, id, toggleTaskCompletion]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !checkpoint || !task) {
    return <ErrorState onGoBack={handleGoBack} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <BackArrowIcon />
          Back to Checkpoint
        </button>

        <TaskHeader
          title={task.title}
          checkpointTitle={checkpointTitle}
          task={task}
        />

        {/* Completion Button */}
        <div className="mt-8 pt-6 border-t border-border">
          <CompletionButton
            isCompleted={task.completed}
            isUpdating={isUpdating}
            onClick={handleToggleCompletion}
          />
        </div>
      </div>

      {/* Resources Section */}
      <ResourcesSection resources={task.resources as Record<string, unknown>} />
    </div>
  );
};
