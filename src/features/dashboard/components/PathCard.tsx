import React from "react";
import type { LearningPath } from "@/types/learning-path";
import { useNavigate } from "react-router-dom";

interface PathCardProps {
  path: LearningPath;
}

export const PathCard: React.FC<PathCardProps> = ({ path }) => {
  const navigate = useNavigate();
  const progress = path.progressPercentage || 0;

  return (
    <div
      onClick={() => navigate(`/roadmaps/${path.id}`)}
      className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
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
        {path.isActive && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-600">
            Active
          </span>
        )}
      </div>

      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
        {path.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
        {path.description}
      </p>

      <div className="mt-auto">
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
      </div>
    </div>
  );
};
