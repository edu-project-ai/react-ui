import React, { useMemo } from "react";
import { useGetActivityCalendarQuery } from "@/features/progress";

// Returns YYYY-MM-DD in local time (toISOString() would shift to UTC and break date keys).
const toLocalDateKey = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const BAR_AREA_PX = 56; // px available for bars (parent h-20 = 80px minus label ~16px, gap 4px)
const MIN_BAR_PX = 4;   // minimum visible height for zero-value bars (muted)

export const ActivityCalendar: React.FC = () => {
  const { data: activityData, isLoading } = useGetActivityCalendarQuery(7);

  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      result.push({
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: toLocalDateKey(date),
      });
    }
    return result;
  }, []);

  const chartData = useMemo(() => {
    if (!activityData) return days.map(() => 0);
    const dataMap = new Map(activityData.map((d) => [d.date, d.itemsCompleted]));
    return days.map((day) => dataMap.get(day.date) || 0);
  }, [activityData, days]);

  const maxActivity = Math.max(...chartData, 1);
  const totalThisWeek = chartData.reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-4" />
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">This week</span>
        <span className="text-xs text-muted-foreground">
          {totalThisWeek} item{totalThisWeek !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-end gap-1.5 h-20">
        {chartData.map((value, index) => {
          // Use explicit px heights — percentage heights collapse inside items-end flex children.
          const barHeight = value > 0
            ? Math.max(Math.round((value / maxActivity) * BAR_AREA_PX), MIN_BAR_PX + 2)
            : MIN_BAR_PX;
          const isToday = index === 6;
          return (
            <div key={index} className="relative flex flex-col items-center gap-1 flex-1 group">
              {/* tooltip */}
              <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10 transition-opacity">
                {value}
              </div>
              <div
                className={`w-full rounded-sm transition-all ${
                  value > 0
                    ? isToday ? "bg-primary" : "bg-primary/50"
                    : "bg-muted"
                }`}
                style={{ height: `${barHeight}px` }}
              />
              <span className={`text-[10px] ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                {days[index].label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
