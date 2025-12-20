import { memo } from "react";
import { Link } from "react-router-dom";
import type { Checkpoint } from "../services/type";
import { isCheckpointCompleted } from "../utils/progress-helpers";

// ============================================================================
// Icon Components
// ============================================================================

const CheckIcon = memo(() => (
  <svg
    className="w-5 h-5 text-white"
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

const ArrowRightIcon = memo(() => (
  <svg
    className="w-4 h-4 ml-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
));
ArrowRightIcon.displayName = "ArrowRightIcon";

// ============================================================================
// Timeline Dot Component
// ============================================================================

interface TimelineDotProps {
  isCompleted: boolean;
}

const TimelineDot = memo(({ isCompleted }: TimelineDotProps) => (
  <div
    className={`absolute left-0 md:left-1/2 w-10 h-10 border-4 rounded-full flex items-center justify-center shadow-sm z-10 transform -translate-x-1/2 md:translate-x-[-50%] transition-colors duration-300 ${
      isCompleted
        ? "bg-green-500 border-green-100 dark:border-green-900"
        : "bg-background border-primary/20"
    }`}
  >
    {isCompleted ? (
      <CheckIcon />
    ) : (
      <div className="w-3 h-3 bg-primary rounded-full" />
    )}
  </div>
));
TimelineDot.displayName = "TimelineDot";

// ============================================================================
// Checkpoint Card Content
// ============================================================================

interface CheckpointCardContentProps {
  checkpoint: Checkpoint;
  index: number;
  isCompleted: boolean;
}

const CheckpointCardContent = memo(
  ({ checkpoint, index, isCompleted }: CheckpointCardContentProps) => (
    <>
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isCompleted
              ? "text-green-600 dark:text-green-400"
              : "text-primary"
          }`}
        >
          Checkpoint {index + 1}
        </span>
        {checkpoint.estimatedDays && (
          <span className="text-xs text-muted-foreground flex items-center">
            <ClockIcon />
            {checkpoint.estimatedDays} days
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {checkpoint.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {checkpoint.description}
      </p>

      <div
        className={`flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform ${
          isCompleted
            ? "text-green-600 dark:text-green-400"
            : "text-primary"
        }`}
      >
        {isCompleted ? "Review Tasks" : "View Tasks"}
        <ArrowRightIcon />
      </div>
    </>
  )
);
CheckpointCardContent.displayName = "CheckpointCardContent";

// ============================================================================
// Main CheckpointTimelineItem Component
// ============================================================================

interface CheckpointTimelineItemProps {
  checkpoint: Checkpoint;
  index: number;
  learningPathId: string;
}

/**
 * A timeline item component for displaying a checkpoint in the learning path.
 * Memoized with extracted sub-components to optimize re-renders.
 */
export const CheckpointTimelineItem = memo(
  ({ checkpoint, index, learningPathId }: CheckpointTimelineItemProps) => {
    const checkpointId = checkpoint.id || `cp-${index + 1}`;
    const isCompleted = isCheckpointCompleted(checkpoint);

    return (
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
        <TimelineDot isCompleted={isCompleted} />

        <Link
          to={`/learning-paths/${learningPathId}/checkpoints/${checkpointId}`}
          className={`ml-12 md:ml-0 md:w-[calc(50%-2.5rem)] bg-card rounded-xl shadow-sm hover:shadow-md transition-all p-6 border group-hover:border-primary/50 ${
            isCompleted
              ? "border-green-200 dark:border-green-900/30"
              : "border-border"
          }`}
        >
          <CheckpointCardContent
            checkpoint={checkpoint}
            index={index}
            isCompleted={isCompleted}
          />
        </Link>
      </div>
    );
  }
);

CheckpointTimelineItem.displayName = "CheckpointTimelineItem";
