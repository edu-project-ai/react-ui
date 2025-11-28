export interface Task {
  id: string;
  type: string;
  title: string;
  estimatedTime: number;
  resources: Record<string, unknown> | null;
  questionsCount: number | null;
  language: string | null;
  difficulty: string | null;
}

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  estimatedDays?: number;
  tasks?: Task[];
}

export interface CheckpointDetail extends Checkpoint {
  completedAt?: string;
}

export interface LearningPathProgress {
  total: number;
  status: string;
  completed: number;
  percentage: number;
}

export interface LearningPath {
  id: string;
  userId?: string;
  title: string;
  description: string;
  goal: string;
  difficultyLevel: string;
  totalCheckpoints?: number;
  progressPercentage?: number;
  isActive: boolean;
  checkpoints: Checkpoint[];
  estimatedDays?: number;
  correlationId?: string;
  planJson?: Record<string, unknown> | null;
  progress?: LearningPathProgress;
  createdAt?: string;
  updatedAt?: string;
}
