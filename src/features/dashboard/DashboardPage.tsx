import React from "react";
import { useGetAllLearningPathsQuery } from "@/features/learning-paths";
import {
  WelcomeHeader,
  ActivePathCard,
  PathCard,
  StatsGrid,
  QuickActions,
  RecentActivity,
  EmptyState,
  ActivityCalendar,
} from "./components";
import { Spinner } from "@/components/ui/spinner";

export const DashboardPage: React.FC = () => {
  const { data: paths, isLoading, error } = useGetAllLearningPathsQuery();

  if (isLoading) {
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

  // Sort paths by updatedAt desc
  const sortedPaths = [...(paths || [])].sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0).getTime();
    const dateB = new Date(b.updatedAt || 0).getTime();
    return dateB - dateA;
  });

  const activePath = sortedPaths[0];
  const otherPaths = sortedPaths.slice(1);

  return (
    <div className="max-w-7xl mx-auto">
      <WelcomeHeader />

      {sortedPaths.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StatsGrid paths={sortedPaths} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {activePath && <ActivePathCard path={activePath} />}

              {otherPaths.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold mb-4">Your other roadmaps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherPaths.slice(0, 4).map((path) => (
                      <PathCard key={path.id} path={path} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
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
