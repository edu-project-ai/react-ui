import React from "react";
import type { LearningPath } from "@/features/learning-paths";
import { useNavigate } from "react-router-dom";

interface RecentActivityProps {
  paths: LearningPath[];
}

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ paths }) => {
  const navigate = useNavigate();

  const recent = [...paths]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 4);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm font-semibold mb-3">Recent activity</p>
      {recent.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No activity yet</p>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((path) => {
            const isGenerating =
              path.generationStatus === "generating" ||
              path.generationStatus === "pending";
            const progress = path.progress?.percentage || 0;
            return (
              <button
                key={path.id}
                className="w-full flex items-center gap-3 py-2.5 text-left hover:text-primary transition-colors first:pt-0 last:pb-0"
                onClick={() => !isGenerating && navigate(`/learning-paths/${path.id}`)}
              >
                <div className="w-7 h-7 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{path.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(path.updatedAt)}
                    {!isGenerating && <span className="ml-1 text-muted-foreground/70">· {progress}%</span>}
                    {isGenerating && <span className="ml-1 text-blue-500">· Generating…</span>}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
