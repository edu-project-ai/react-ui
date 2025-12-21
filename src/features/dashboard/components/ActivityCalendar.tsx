import React from "react";

export const ActivityCalendar: React.FC = () => {
  // Mock data for the last 7 days
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activityData = [3, 5, 2, 8, 4, 1, 0]; // Hours or tasks completed
  const maxActivity = Math.max(...activityData, 8); // Ensure at least some height

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Learning Activity</h3>
        <select className="text-xs bg-transparent border border-border rounded-md px-2 py-1 outline-none">
          <option>This Week</option>
          <option>Last Week</option>
        </select>
      </div>

      <div className="flex items-end justify-between gap-2 h-32">
        {activityData.map((value, index) => {
          const heightPercentage = (value / maxActivity) * 100;
          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full relative group">
                <div
                  className="w-full bg-primary/20 rounded-t-md hover:bg-primary/30 transition-colors relative"
                  style={{ height: `${heightPercentage}%`, minHeight: "4px" }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap transition-opacity z-10 pointer-events-none">
                    {value} hours
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{days[index]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
