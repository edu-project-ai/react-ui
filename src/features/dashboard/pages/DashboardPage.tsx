import React, { useMemo } from "react";
import { useGetAllLearningPathsQuery } from "@/features/learning-paths";
import {
  useGetUserStatisticsQuery,
  useGetLearningPathsProgressQuery,
} from "@/features/progress";
import { WelcomeHeader } from "../components/WelcomeHeader";
import { ActivePathCard } from "../components/ActivePathCard";
import { PathCard } from "../components/PathCard";
import { StatsGrid } from "../components/StatsGrid";
import { QuickActions } from "../components/QuickActions";
import { RecentActivity } from "../components/RecentActivity";
import { EmptyState } from "../components/EmptyState";
import { ActivityCalendar } from "../components/ActivityCalendar";
import { Spinner } from "@/components/ui/spinner";

export const DashboardPage: React.FC = () => {
  const { data: paths, isLoading, error } = useGetAllLearningPathsQuery();

  const {
    data: statistics,
    isLoading: statsLoading,
  } = useGetUserStatisticsQuery();

  const {
    data: pathsProgress,
    isLoading: progressLoading,
  } = useGetLearningPathsProgressQuery();

  const isAnyLoading = isLoading || statsLoading || progressLoading;

  const sortedPaths = useMemo(
    () =>
      [...(paths || [])]
        .filter((p) => p.isActive !== false)
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt || 0).getTime();
          const dateB = new Date(b.updatedAt || 0).getTime();
          return dateB - dateA;
        }),
    [paths]
  );

  // Build a fast lookup from the statistics API (accurate progress source)
  const progressMap = useMemo(
    () => new Map((pathsProgress || []).map((p) => [p.learningPathId, p.completionPercentage])),
    [pathsProgress]
  );

  // Enrich paths with accurate completion percentage from the statistics endpoint
  const enrichedPaths = useMemo(
    () =>
      sortedPaths.map((p) => ({
        ...p,
        progress: {
          ...(p.progress ?? { total: 0, completed: 0, totalTasks: 0, completedTasks: 0 }),
          percentage: progressMap.get(p.id) ?? p.progress?.percentage ?? 0,
        },
      })),
    [sortedPaths, progressMap]
  );

  if (isAnyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load dashboard data.</p>
      </div>
    );
  }

  const activePath = enrichedPaths[0];
  const otherPaths = enrichedPaths.slice(1);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <WelcomeHeader />

      {sortedPaths.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Single unified stats row */}
          <StatsGrid statistics={statistics} paths={enrichedPaths} progress={pathsProgress} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content – 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {activePath && <ActivePathCard path={activePath} />}

              {otherPaths.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold text-foreground mb-3">Other roadmaps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherPaths.slice(0, 4).map((path) => (
                      <PathCard key={path.id} path={path} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar – 1/3 width */}
            <div className="space-y-4">
              <ActivityCalendar />
              <QuickActions />
              <RecentActivity paths={enrichedPaths} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
