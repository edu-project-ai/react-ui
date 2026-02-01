import { memo } from "react";
import { useNavigate } from "react-router-dom";
import type { LearningPathProgress } from "../types";

interface PathProgressListProps {
  paths: LearningPathProgress[];
}

const PathProgressCard = memo(({ path }: { path: LearningPathProgress }) => {
  const navigate = useNavigate();

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleClick = () => {
    navigate(`/learning-paths/${path.learningPathId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all cursor-pointer hover:border-primary"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {path.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {path.completedItems} / {path.totalItems} items
            </span>
            {path.timeSpentMinutes > 0 && (
              <>
                <span>•</span>
                <span>{formatTime(path.timeSpentMinutes)}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-2xl font-bold text-primary">
          {Math.round(path.completionPercentage)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${path.completionPercentage}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Last accessed: {formatDate(path.lastAccessedAt)}</span>
        {path.estimatedDaysRemaining > 0 && (
          <span className="text-primary font-medium">
            ~{path.estimatedDaysRemaining} days left
          </span>
        )}
      </div>
    </div>
  );
});
PathProgressCard.displayName = "PathProgressCard";

const EmptyState = memo(() => (
  <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
    <div className="max-w-md mx-auto">
      <div className="text-6xl mb-4">📚</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No Learning Paths Yet
      </h3>
      <p className="text-muted-foreground mb-6">
        Start your learning journey by creating your first roadmap
      </p>
      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
));
EmptyState.displayName = "EmptyState";

export const PathProgressList = memo(({ paths }: PathProgressListProps) => {
  if (paths.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {paths.map((path) => (
        <PathProgressCard key={path.learningPathId} path={path} />
      ))}
    </div>
  );
});
PathProgressList.displayName = "PathProgressList";
