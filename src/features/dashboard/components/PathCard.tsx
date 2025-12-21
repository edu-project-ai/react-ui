import React from "react";
import type { LearningPath } from "@/features/learning-paths/services/type";
import { useNavigate } from "react-router-dom";

interface PathCardProps {
  path: LearningPath;
}

/**
 * Helper to extract status from planJson
 */
const getPlanStatus = (planJson?: Record<string, unknown> | null): string | null => {
  if (!planJson) return null;
  const status = planJson.Status ?? planJson.status;
  return typeof status === "string" ? status : null;
};

const SpinnerIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
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
);

const GeneratingBadge = () => (
  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 animate-pulse">
    <SpinnerIcon className="w-3 h-3 mr-1" />
    Generating
  </span>
);

export const PathCard: React.FC<PathCardProps> = ({ path }) => {
  const navigate = useNavigate();
  const progress = path.progress?.percentage || 0;
  const planStatus = getPlanStatus(path.planJson);
  const isGenerating = planStatus === "generating";

  const handleClick = () => {
    if (!isGenerating) {
      navigate(`/learning-paths/${path.id}`);
    }
  };

  // Determine card styling based on state
  const cardClassName = isGenerating
    ? "bg-blue-50/30 dark:bg-blue-900/10 border-blue-300 dark:border-blue-800 border rounded-xl p-5 shadow-sm cursor-wait flex flex-col h-full"
    : "bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full";

  return (
    <div onClick={handleClick} className={cardClassName}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isGenerating ? 'bg-blue-500/10 text-blue-600' : 'bg-primary/5 text-primary group-hover:bg-primary/10'} transition-colors`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        {isGenerating ? (
          <GeneratingBadge />
        ) : (
          path.isActive && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-600">
              Active
            </span>
          )
        )}
      </div>

      <h3 className={`font-semibold text-lg mb-2 line-clamp-1 ${!isGenerating && 'group-hover:text-primary'} transition-colors`}>
        {path.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
        {path.description}
      </p>

      <div className="mt-auto">
        {!isGenerating ? (
          <>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
            <SpinnerIcon className="w-3 h-3 mr-1.5" />
            <span>Creating roadmap...</span>
          </div>
        )}
      </div>
    </div>
  );
};
