import React from "react";
import type { LearningPath } from "@/features/learning-paths/services/type";

interface StatsGridProps {
  paths: LearningPath[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ paths }) => {
  // Calculate statistics
  const totalPaths = paths.length;
  const activePaths = paths.filter((p) => p.isActive).length;
  const completedPaths = paths.filter((p) => (p.progress?.percentage || 0) === 100).length;
  const totalCheckpoints = paths.reduce(
    (acc, p) => acc + (p.checkpoints?.length || 0),
    0
  );
  const completedCheckpoints = paths.reduce((acc, p) => {
    const total = p.checkpoints?.length || 0;
    const progress = p.progress?.percentage || 0;
    return acc + Math.round((total * progress) / 100);
  }, 0);

  const stats = [
    {
      label: "Active paths",
      value: activePaths,
      icon: (
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
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Completed",
      value: completedPaths,
      icon: (
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
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Checkpoints passed",
      value: `${completedCheckpoints}/${totalCheckpoints}`,
      icon: (
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
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      ),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Total roadmaps",
      value: totalPaths,
      icon: (
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
      ),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
