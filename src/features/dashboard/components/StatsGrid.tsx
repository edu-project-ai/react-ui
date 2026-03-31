import React from "react";
import type { LearningPath } from "@/features/learning-paths";
import type { LearningPathProgress, UserStatistics } from "@/features/progress";

interface StatsGridProps {
  paths?: LearningPath[];
  progress?: LearningPathProgress[];
  statistics?: UserStatistics;
}

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, sub, icon, accent }) => (
  <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold leading-none tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
    </div>
  </div>
);

export const StatsGrid: React.FC<StatsGridProps> = ({ paths, progress, statistics }) => {
  const totalItems = statistics?.totalItemsCompleted ?? 0;
  const streak = statistics?.currentStreak ?? 0;
  const learningDays = statistics?.totalLearningDays ?? 0;
  const totalRoadmaps = paths?.length ?? 0;

  const avgProgress =
    progress && progress.length > 0
      ? Math.round(
          progress.reduce((acc, p) => acc + p.completionPercentage, 0) /
            progress.length
        )
      : 0;

  const completedPaths =
    progress?.filter((p) => p.completionPercentage >= 100).length ?? 0;

  const tiles: StatTileProps[] = [
    {
      label: "Items completed",
      value: totalItems,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      accent: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "Current streak",
      value: streak,
      sub: streak === 1 ? "day in a row" : "days in a row",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
          <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
        </svg>
      ),
      accent: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
      label: "Avg. path progress",
      value: `${avgProgress}%`,
      sub: `${completedPaths} of ${totalRoadmaps} finished`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 8 12 12 14 14"></polyline>
        </svg>
      ),
      accent: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Learning days",
      value: learningDays,
      sub: `Across ${totalRoadmaps} roadmap${totalRoadmaps !== 1 ? "s" : ""}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      accent: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((t) => (
        <StatTile key={t.label} {...t} />
      ))}
    </div>
  );
};
