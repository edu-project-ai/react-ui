import { memo } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  isCompleted?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar = memo(
  ({
    percentage,
    isCompleted = false,
    size = "md",
    showLabel = false,
    label,
    className,
  }: ProgressBarProps) => {
    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    const getProgressColor = () => {
      if (isCompleted || clampedPercentage >= 100) {
        return "bg-green-500";
      }
      if (clampedPercentage >= 70) {
        return "bg-primary";
      }
      if (clampedPercentage >= 30) {
        return "bg-yellow-500";
      }
      return "bg-primary";
    };

    const getTextColor = () => {
      if (isCompleted || clampedPercentage >= 100) {
        return "text-green-600 dark:text-green-400";
      }
      return "text-foreground";
    };

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3",
    };

    return (
      <div className={cn("w-full", className)}>
        {showLabel && (
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-muted-foreground">
              {label || "Progress"}
            </span>
            <span className={cn("font-semibold", getTextColor())}>
              {Math.round(clampedPercentage)}%
            </span>
          </div>
        )}
        <div
          className={cn(
            "w-full bg-muted rounded-full overflow-hidden",
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              getProgressColor(),
              "h-full rounded-full transition-all duration-500 ease-out"
            )}
            style={{ width: `${clampedPercentage}%` }}
            role="progressbar"
            aria-valuenow={clampedPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
