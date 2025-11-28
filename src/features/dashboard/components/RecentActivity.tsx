import React from "react";
import type { LearningPath } from "@/types/learning-path";
import { useNavigate } from "react-router-dom";

interface RecentActivityProps {
  paths: LearningPath[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ paths }) => {
  const navigate = useNavigate();

  // Get recent paths sorted by updatedAt
  const recentPaths = [...paths]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} h ago`;
    if (diffDays < 7) return `${diffDays} d ago`;
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  if (recentPaths.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Recent activity</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Recent activity</h3>
      <div className="space-y-4">
        {recentPaths.map((path) => (
          <div
            key={path.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
            onClick={() => navigate(`/roadmaps/${path.id}`)}
          >
            <div className="mt-1 p-1.5 rounded-md bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{path.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(path.updatedAt)}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {path.progressPercentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
