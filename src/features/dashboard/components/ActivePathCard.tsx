import React from "react";
import type { LearningPath } from "@/features/learning-paths/services/type";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ActivePathCardProps {
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

const SpinnerIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
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
  <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide rounded-full animate-pulse">
    <SpinnerIcon className="w-3 h-3 mr-1.5" />
    Generating
  </span>
);

export const ActivePathCard: React.FC<ActivePathCardProps> = ({ path }) => {
  const navigate = useNavigate();
  const progress = path.progress?.percentage || 0;
  const planStatus = getPlanStatus(path.planJson);
  const isGenerating = planStatus === "generating";

  // Determine card styling based on state
  const cardClassName = isGenerating
    ? "bg-blue-50/30 dark:bg-blue-900/10 border-blue-300 dark:border-blue-800 border rounded-xl p-6 shadow-sm mb-8 relative overflow-hidden"
    : "bg-card border border-border rounded-xl p-6 shadow-sm mb-8 relative overflow-hidden group";

  return (
    <div className={cardClassName}>
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {isGenerating ? (
                <GeneratingBadge />
              ) : (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Continue learning
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">{path.title}</h2>
            <p className="text-muted-foreground mb-4 max-w-2xl line-clamp-2">
              {path.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>~{path.estimatedDays || 90} days</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{path.checkpoints?.length || 0} checkpoints</span>
              </div>
            </div>

            {/* Show progress only when not generating */}
            {!isGenerating && (
              <div className="max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Show generating message */}
            {isGenerating && (
              <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <SpinnerIcon className="w-4 h-4 mr-2" />
                <span>Your roadmap is being created...</span>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={() => navigate(`/learning-paths/${path.id}`)}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Continue"}
              {!isGenerating && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
