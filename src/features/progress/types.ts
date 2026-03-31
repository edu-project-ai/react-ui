export interface UserStatistics {
  totalItemsCompleted: number;
  totalTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalLearningDays: number;
  averageItemsPerDay: number;
  averageTimePerItem: number;
  lastActivityDate: string | null;
  completionByType: Record<string, number>;
}

export interface ActivityCalendarData {
  date: string;
  itemsCompleted: number;
  timeSpentMinutes: number;
  lastActivityType: string | null;
}

export interface LearningPathProgress {
  learningPathId: string;
  title: string;
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  timeSpentMinutes: number;
  startedAt: string | null;
  lastAccessedAt: string | null;
  estimatedDaysRemaining: number;
}
