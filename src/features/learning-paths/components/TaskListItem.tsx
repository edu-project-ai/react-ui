import { memo } from "react";
import { Link } from "react-router-dom";
import type { LearningItem } from "../services/type";

// ============================================================================
// Icon Components
// ============================================================================

const CheckIcon = memo(() => (
  <svg
    className="w-5 h-5"
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

const ClockIcon = memo(() => (
  <svg
    className="w-4 h-4 mr-1"
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

const ChevronRightIcon = memo(({ isCompleted }: { isCompleted: boolean }) => (
  <svg
    className={`w-5 h-5 transform transition-transform group-hover:translate-x-1 ${
      isCompleted
        ? "text-green-400"
        : "text-muted-foreground group-hover:text-primary"
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
));
ChevronRightIcon.displayName = "ChevronRightIcon";

// ============================================================================
// Status Icon Component
// ============================================================================

interface StatusIconProps {
  index: number;
  isCompleted: boolean;
}

const StatusIcon = memo(({ index, isCompleted }: StatusIconProps) => (
  <div
    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 transition-colors ${
      isCompleted
        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
    }`}
  >
    {isCompleted ? <CheckIcon /> : <span className="text-sm font-bold">{index + 1}</span>}
  </div>
));
StatusIcon.displayName = "StatusIcon";

// ============================================================================
// Task Metadata Component
// ============================================================================

interface TaskMetadataProps {
  estimatedTime?: number;
  type?: string;
}

const TaskMetadata = memo(({ estimatedTime, type }: TaskMetadataProps) => (
  <div className="flex items-center mt-1 space-x-4 text-sm text-muted-foreground">
    {estimatedTime !== undefined && estimatedTime > 0 && (
      <span className="flex items-center">
        <ClockIcon />
        {estimatedTime} min
      </span>
    )}
    {type && (
      <span className="capitalize bg-muted px-2 py-0.5 rounded text-xs">
        {type}
      </span>
    )}
  </div>
));
TaskMetadata.displayName = "TaskMetadata";

// ============================================================================
// Main TaskListItem Component
// ============================================================================

interface TaskListItemProps {
  task: LearningItem;
  index: number;
  learningPathId: string;
  checkpointId: string;
  realCheckpointId?: string;
  checkpointTitle?: string;
}

/**
 * A list item component for displaying a task in a checkpoint.
 * Memoized with extracted sub-components to optimize re-renders.
 */
export const TaskListItem = memo(
  ({
    task,
    index,
    learningPathId,
    checkpointId,
    realCheckpointId,
    checkpointTitle,
  }: TaskListItemProps) => {
    const isCompleted = task.isCompleted;

    return (
      <Link
        to={`/learning-paths/${learningPathId}/tasks/${task.id}`}
        state={{
          checkpointId,
          realCheckpointId: realCheckpointId || checkpointId,
          checkpointTitle,
        }}
        className={`group block bg-card rounded-xl shadow-sm hover:shadow-md transition-all border p-5 ${
          isCompleted
            ? "border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10"
            : "border-border hover:border-primary/50"
        }`}
      >
        <div className="flex items-center">
          <StatusIcon index={index} isCompleted={isCompleted} />

          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-semibold truncate ${
                isCompleted
                  ? "text-muted-foreground line-through decoration-muted-foreground"
                  : "text-foreground group-hover:text-primary"
              }`}
            >
              {task.title}
            </h3>
            <TaskMetadata estimatedTime={task.estimatedTime} type={task.type} />
          </div>

          <div className="ml-4 flex-shrink-0">
            <ChevronRightIcon isCompleted={isCompleted} />
          </div>
        </div>
      </Link>
    );
  }
);

TaskListItem.displayName = "TaskListItem";
