export interface Task {
  id: string;
  type: string;
  title: string;
  estimatedTime: number;
  resources: Record<string, unknown> | null;
  questionsCount: number | null;
  language: string | null;
  difficulty: string | null;
  completed: boolean; // Added for task completion status
}

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  estimatedDays?: number;
  tasks?: Task[];
  completed?: boolean; // Added for checkpoint completion status
}

export interface CheckpointDetail extends Checkpoint {
  tasks: Task[]; // Required for checkpoint detail page
  completedAt?: string;
}

export interface LearningPathProgress {
  total: number;
  completed: number;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  status?: string;
}

export interface TaskCompletionRequest {
  checkpointId: string;
  taskId: string;
  completed: boolean;
}

export interface TaskCompletionResponse {
  message: string;
  progress: LearningPathProgress;
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
