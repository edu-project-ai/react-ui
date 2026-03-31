import { memo } from "react";
import type { UserStatistics } from "../types";

interface OverallStatsProps {
  statistics: UserStatistics;
}

const StatCard = memo(
  ({
    icon,
    label,
    value,
    suffix,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    suffix?: string;
    color: string;
  }) => (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
        </div>
      </div>
    </div>
  )
);
StatCard.displayName = "StatCard";

const CheckIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
));
CheckIcon.displayName = "CheckIcon";

const ClockIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));
ClockIcon.displayName = "ClockIcon";

const FireIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
));
FireIcon.displayName = "FireIcon";

const CalendarIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
));
CalendarIcon.displayName = "CalendarIcon";

export const OverallStats = memo(({ statistics }: OverallStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<CheckIcon />}
        label="Items Completed"
        value={statistics.totalItemsCompleted}
        color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      />
      <StatCard
        icon={<ClockIcon />}
        label="Avg. Items/Day"
        value={statistics.averageItemsPerDay.toFixed(1)}
        color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <StatCard
        icon={<FireIcon />}
        label="Current Streak"
        value={statistics.currentStreak}
        suffix="days"
        color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
      />
      <StatCard
        icon={<CalendarIcon />}
        label="Learning Days"
        value={statistics.totalLearningDays}
        color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      />
    </div>
  );
});
OverallStats.displayName = "OverallStats";
