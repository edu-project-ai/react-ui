import type { LearningPathProgress, Task, Checkpoint, LearningItem } from "../services/type";

/**
 * Calculate progress percentage from completed and total tasks
 */
export const calculateProgressPercentage = (
  completedTasks: number,
  totalTasks: number
): number => {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
};

/**
 * Get progress bar color based on percentage
 * @param percentage - Progress percentage (0-100)
 * @param isCompleted - Whether the item is fully completed
 */
export const getProgressColor = (
  percentage: number,
  isCompleted: boolean = false
): string => {
  if (isCompleted || percentage >= 100) {
    return "bg-green-500 dark:bg-green-500";
  }
  return "bg-primary-600";
};

/**
 * Get progress text color based on percentage
 */
export const getProgressTextColor = (
  percentage: number,
  isCompleted: boolean = false
): string => {
  if (isCompleted || percentage >= 100) {
    return "text-green-600 dark:text-green-400";
  }
  return "text-primary-600 dark:text-primary-400";
};

/**
 * Check if checkpoint is completed
 */
export const isCheckpointCompleted = (checkpoint: { isCompleted: boolean; items?: LearningItem[] }): boolean => {
  if (checkpoint.isCompleted !== undefined) {
    return checkpoint.isCompleted;
  }
  if (checkpoint.items && checkpoint.items.length > 0) {
    return checkpoint.items.every((item) => item.isCompleted);
  }
  return false;
};

/**
 * Calculate checkpoint progress
 */
export const calculateCheckpointProgress = (
  tasks: Task[]
): { completed: number; total: number; percentage: number } => {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const percentage = calculateProgressPercentage(completed, total);
  return { completed, total, percentage };
};

/**
 * Calculate checkpoint progress from items (new API)
 */
export const calculateCheckpointProgressFromItems = (
  items: LearningItem[]
): { completed: number; total: number; percentage: number } => {
  const total = items.length;
  const completed = items.filter((item) => item.isCompleted).length;
  const percentage = calculateProgressPercentage(completed, total);
  return { completed, total, percentage };
};

/**
 * Get learning path progress from progress object or calculate from checkpoints
 */
export const getLearningPathProgress = (
  progress?: LearningPathProgress,
  checkpoints?: Checkpoint[]
): LearningPathProgress | null => {
  if (progress) return progress;

  if (!checkpoints || checkpoints.length === 0) return null;

  let totalTasks = 0;
  let completedTasks = 0;

  checkpoints.forEach((checkpoint) => {
    if (checkpoint.items) {
      totalTasks += checkpoint.items.length;
      completedTasks += checkpoint.items.filter((t: LearningItem) => t.isCompleted).length;
    }
  });

  return {
    total: checkpoints.length,
    completed: checkpoints.filter((c) => isCheckpointCompleted(c)).length,
    totalTasks,
    completedTasks,
    percentage: calculateProgressPercentage(completedTasks, totalTasks),
  };
};
