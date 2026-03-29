import { memo, useState } from "react";
import type { ActivityCalendarData } from "../types";

interface ActivityHeatmapProps {
  data: ActivityCalendarData[];
}

interface TooltipData {
  date: string;
  items: number;
  time: number;
  type: string | null;
  x: number;
  y: number;
}

const ActivityCell = memo(
  ({
    activity,
    onHover,
    onLeave,
  }: {
    activity: ActivityCalendarData | null;
    onHover: (data: TooltipData, event: React.MouseEvent) => void;
    onLeave: () => void;
  }) => {
    const getIntensity = (items: number): string => {
      if (items === 0) return "bg-muted";
      if (items <= 2) return "bg-green-200 dark:bg-green-900/40";
      if (items <= 5) return "bg-green-400 dark:bg-green-700/60";
      if (items <= 10) return "bg-green-600 dark:bg-green-600/80";
      return "bg-green-800 dark:bg-green-500";
    };

    const handleMouseEnter = (event: React.MouseEvent) => {
      if (activity && activity.itemsCompleted > 0) {
        onHover(
          {
            date: activity.date,
            items: activity.itemsCompleted,
            time: activity.timeSpentMinutes,
            type: activity.lastActivityType,
            x: event.clientX,
            y: event.clientY,
          },
          event
        );
      }
    };

    return (
      <div
        className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
          activity ? getIntensity(activity.itemsCompleted) : "bg-muted"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onLeave}
      />
    );
  }
);
ActivityCell.displayName = "ActivityCell";

const Tooltip = memo(({ data }: { data: TooltipData }) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      className="fixed z-50 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border p-3 text-sm pointer-events-none"
      style={{
        left: `${data.x + 10}px`,
        top: `${data.y - 60}px`,
      }}
    >
      <div className="font-semibold mb-1">{formatDate(data.date)}</div>
      <div className="text-muted-foreground">
        {data.items} item{data.items !== 1 ? "s" : ""} completed
      </div>
      {data.time > 0 && (
        <div className="text-muted-foreground">
          {formatTime(data.time)} spent
        </div>
      )}
      {data.type && (
        <div className="text-xs text-muted-foreground mt-1">
          Last: {data.type}
        </div>
      )}
    </div>
  );
});
Tooltip.displayName = "Tooltip";

export const ActivityHeatmap = memo(({ data }: ActivityHeatmapProps) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Generate last 180 days grid
  const generateCalendarGrid = (): (ActivityCalendarData | null)[][] => {
    const weeks: (ActivityCalendarData | null)[][] = [];
    const dataMap = new Map(data.map((d) => [d.date, d]));

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 179); // 180 days including today

    // Adjust to start from Sunday of that week
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    let currentWeek: (ActivityCalendarData | null)[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < 26 * 7; i++) {
      // 26 weeks
      const dateStr = currentDate.toISOString().split("T")[0];
      const activity = dataMap.get(dateStr) || null;

      currentWeek.push(activity);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeks;
  };

  const weeks = generateCalendarGrid();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleCellHover = (data: TooltipData) => {
    setTooltip(data);
  };

  const handleCellLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex gap-1">
        {/* Weekday labels */}
        <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground pt-4">
          {weekDays.map((day, i) => (
            <div key={day} className="h-3 flex items-center">
              {i % 2 === 1 && day}
            </div>
          ))}
        </div>

        {/* Activity grid */}
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((activity, dayIndex) => (
                <ActivityCell
                  key={`${weekIndex}-${dayIndex}`}
                  activity={activity}
                  onHover={handleCellHover}
                  onLeave={handleCellLeave}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted" />
        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40" />
        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/60" />
        <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600/80" />
        <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-500" />
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && <Tooltip data={tooltip} />}
    </div>
  );
});
ActivityHeatmap.displayName = "ActivityHeatmap";
