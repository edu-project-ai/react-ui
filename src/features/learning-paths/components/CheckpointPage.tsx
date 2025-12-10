import { memo } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetCheckpointQuery } from "../api";
import { Spinner } from "@/components/ui";
import type { Task } from "../services/type";
import { calculateCheckpointProgress } from "../utils";
import { ProgressBar } from "./ProgressBar";
import { TaskListItem } from "./TaskListItem";

// ============================================================================
// Icon Components
// ============================================================================

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

const ClockIcon = memo(() => (
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
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
));
ClockIcon.displayName = "ClockIcon";

const TasksIcon = memo(() => (
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
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
));
TasksIcon.displayName = "TasksIcon";

// ============================================================================
// Loading & Error States
// ============================================================================

const LoadingState = memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
  </div>
));
LoadingState.displayName = "LoadingState";

interface ErrorStateProps {
  learningPathId: string;
}

const ErrorState = memo(({ learningPathId }: ErrorStateProps) => (
  <div className="container mx-auto px-4 py-8">
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p className="text-destructive">
        Failed to load checkpoint. Please try again later.
      </p>
    </div>
    <Link
      to={`/learning-paths/${learningPathId}`}
      className="inline-block mt-4 text-primary hover:text-primary/80"
    >
      ← Back to Learning Path
    </Link>
  </div>
));
ErrorState.displayName = "ErrorState";

// ============================================================================
// Metadata Badges Component
// ============================================================================

interface MetadataBadgesProps {
  estimatedDays?: number;
  totalTasks: number;
}

const MetadataBadges = memo(({ estimatedDays, totalTasks }: MetadataBadgesProps) => (
  <div className="flex flex-wrap gap-6 mb-8">
    {estimatedDays && (
      <div className="flex items-center text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
        <ClockIcon />
        <span className="font-medium">{estimatedDays} days estimated</span>
      </div>
    )}
    <div className="flex items-center text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
      <TasksIcon />
      <span className="font-medium">{totalTasks} tasks</span>
    </div>
  </div>
));
MetadataBadges.displayName = "MetadataBadges";

// ============================================================================
// Checkpoint Header Component
// ============================================================================

interface CheckpointHeaderProps {
  title: string;
  description: string;
  estimatedDays?: number;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}

const CheckpointHeader = memo(({
  title,
  description,
  estimatedDays,
  totalTasks,
  completedTasks,
  progressPercentage,
}: CheckpointHeaderProps) => (
  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <MetadataBadges estimatedDays={estimatedDays} totalTasks={totalTasks} />

      {/* Progress Bar */}
      <div className="bg-muted/50 rounded-xl p-5 border border-border">
        <ProgressBar
          percentage={progressPercentage}
          isCompleted={progressPercentage >= 100}
          size="md"
          showLabel
          label="Checkpoint Progress"
        />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>
    </div>
  </div>
));
CheckpointHeader.displayName = "CheckpointHeader";

// ============================================================================
// Tasks List Component
// ============================================================================

interface TasksListProps {
  tasks: Task[];
  learningPathId: string;
  checkpointId: string;
  realCheckpointId: string;
  checkpointTitle: string;
}

const TasksList = memo(({
  tasks,
  learningPathId,
  checkpointId,
  realCheckpointId,
  checkpointTitle,
}: TasksListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 text-center border border-dashed border-border">
        <p className="text-muted-foreground text-lg">
          No tasks available for this checkpoint yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <TaskListItem
          key={task.id}
          task={task}
          index={index}
          learningPathId={learningPathId}
          checkpointId={checkpointId}
          realCheckpointId={realCheckpointId}
          checkpointTitle={checkpointTitle}
        />
      ))}
    </div>
  );
});
TasksList.displayName = "TasksList";

// ============================================================================
// Main Page Component
// ============================================================================

export const CheckpointPage = () => {
  const { id, checkpointId } = useParams<{
    id: string;
    checkpointId: string;
  }>();

  const {
    data: checkpoint,
    isLoading,
    error,
  } = useGetCheckpointQuery({
    learningPathId: id!,
    checkpointId: checkpointId!,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !checkpoint) {
    return <ErrorState learningPathId={id!} />;
  }

  const {
    completed: completedTasks,
    total: totalTasks,
    percentage: progressPercentage,
  } = calculateCheckpointProgress(checkpoint.tasks);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/learning-paths/${id}`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <BackArrowIcon />
          Back to Learning Path
        </Link>

        <CheckpointHeader
          title={checkpoint.title}
          description={checkpoint.description}
          estimatedDays={checkpoint.estimatedDays}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          progressPercentage={progressPercentage}
        />
      </div>

      {/* Tasks List */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
          Tasks
          <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
            {totalTasks}
          </span>
        </h2>

        <TasksList
          tasks={checkpoint.tasks}
          learningPathId={id!}
          checkpointId={checkpointId!}
          realCheckpointId={checkpoint.id}
          checkpointTitle={checkpoint.title}
        />
      </div>
    </div>
  );
};
