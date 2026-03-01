import React from "react";
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

  const sortedPaths = [...(paths || [])].sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0).getTime();
    const dateB = new Date(b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  const activePath = sortedPaths[0];
  const otherPaths = sortedPaths.slice(1);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <WelcomeHeader />

      {sortedPaths.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Single unified stats row */}
          <StatsGrid statistics={statistics} paths={sortedPaths} progress={pathsProgress} />

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
              <RecentActivity paths={sortedPaths} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
