import React, { useMemo } from "react";
import { useGetActivityCalendarQuery } from "@/features/progress/api/statisticsApi";

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
        date: date.toISOString().split("T")[0],
      });
    }
    return result;
  }, []);

  const chartData = useMemo(() => {
    if (!activityData) return days.map(() => 0);

    const dataMap = new Map(activityData.map((d) => [d.date, d.itemsCompleted]));
    return days.map((day) => dataMap.get(day.date) || 0);
  }, [activityData, days]);

  const maxActivity = Math.max(...chartData, 8);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Learning Activity</h3>
        <div className="text-xs text-muted-foreground">This Week</div>
      </div>

      <div className="flex items-end justify-between gap-2 h-32">
        {chartData.map((value, index) => {
          const heightPercentage = (value / maxActivity) * 100;
          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full relative group">
                <div
                  className="w-full bg-primary/20 rounded-t-md hover:bg-primary/30 transition-colors relative"
                  style={{ height: `${heightPercentage}%`, minHeight: "4px" }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap transition-opacity z-10 pointer-events-none">
                    {value} item{value !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{days[index].label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
