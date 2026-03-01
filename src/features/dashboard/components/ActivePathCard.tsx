import React from "react";
import type { LearningPath } from "@/features/learning-paths";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ActivePathCardProps {
  path: LearningPath;
}

const getPlanStatus = (planJson?: Record<string, unknown> | null): string | null => {
  if (!planJson) return null;
  const status = planJson.Status ?? planJson.status;
  return typeof status === "string" ? status : null;
};

export const ActivePathCard: React.FC<ActivePathCardProps> = ({ path }) => {
  const navigate = useNavigate();
  const progress = path.progress?.percentage || 0;
  const isGenerating = getPlanStatus(path.planJson) === "generating";

  return (
    <div className={`bg-card border rounded-xl p-6 ${isGenerating ? "border-blue-300 dark:border-blue-800" : "border-border"}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary mb-2">
            {isGenerating ? "Generating…" : "Continue learning"}
          </span>
          <h2 className="text-xl font-bold text-foreground leading-tight line-clamp-1">
            {path.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {path.description}
          </p>
        </div>

        <Button
          size="sm"
          className="shrink-0 mt-1"
          disabled={isGenerating}
          onClick={() => navigate(`/learning-paths/${path.id}`)}
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Generating</>
          ) : (
            <>Continue <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="ml-1.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>
          )}
        </Button>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          ~{path.estimatedDays || 90} days
        </span>
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {path.checkpoints?.length || 0} checkpoint{(path.checkpoints?.length || 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress bar */}
      {!isGenerating && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Your roadmap is being created…
        </div>
      )}
    </div>
  );
};
