import React from "react";
import type { LearningPath } from "@/types/learning-path";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ActivePathCardProps {
  path: LearningPath;
}

export const ActivePathCard: React.FC<ActivePathCardProps> = ({ path }) => {
  const navigate = useNavigate();
  const progress = path.progressPercentage || 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8 relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
              Continue learning
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
                <span>{path.totalCheckpoints || 0} checkpoints</span>
              </div>
            </div>

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
          </div>

          <div className="flex-shrink-0">
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={() => navigate(`/learning-paths/${path.id}`)}
            >
              Continue
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
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
