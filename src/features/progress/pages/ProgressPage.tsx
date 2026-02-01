import { memo } from "react";
import {
  useGetUserStatisticsQuery,
  useGetActivityCalendarQuery,
  useGetLearningPathsProgressQuery,
} from "../api/statisticsApi";
import { OverallStats } from "../components/OverallStats";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import { PathProgressList } from "../components/PathProgressList";
import { Spinner } from "@/components/ui/spinner";

const LoadingState = memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
  </div>
));
LoadingState.displayName = "LoadingState";

const ErrorState = memo(({ message }: { message: string }) => (
  <div className="container mx-auto px-4 py-8">
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p className="text-destructive">{message}</p>
    </div>
  </div>
));
ErrorState.displayName = "ErrorState";

export const ProgressPage = () => {
  const {
    data: statistics,
    isLoading: statsLoading,
    error: statsError,
  } = useGetUserStatisticsQuery();

  const {
    data: activityCalendar,
    isLoading: activityLoading,
    error: activityError,
  } = useGetActivityCalendarQuery(180);

  const {
    data: pathsProgress,
    isLoading: pathsLoading,
    error: pathsError,
  } = useGetLearningPathsProgressQuery();

  const isLoading = statsLoading || activityLoading || pathsLoading;
  const hasError = statsError || activityError || pathsError;

  if (isLoading) {
    return <LoadingState />;
  }

  if (hasError) {
    return <ErrorState message="Failed to load progress data. Please try again later." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Progress
        </h1>
        <p className="text-muted-foreground">
          Track your learning journey and celebrate your achievements
        </p>
      </div>

      {/* Overall Statistics */}
      {statistics && <OverallStats statistics={statistics} />}

      {/* Activity Heatmap */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Activity Calendar
        </h2>
        {activityCalendar && <ActivityHeatmap data={activityCalendar} />}
      </div>

      {/* Learning Paths Progress */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Learning Paths
        </h2>
        {pathsProgress && <PathProgressList paths={pathsProgress} />}
      </div>
    </div>
  );
};
