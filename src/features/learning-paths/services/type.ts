/**
 * Task model
 */
export interface Task {
  id: string;
  type: string;
  title: string;
  estimatedTime: number;
  resources: Record<string, unknown> | null;
  questionsCount: number | null;
  language: string | null;
  difficulty: string | null;
  completed: boolean;
}

/**
 * Checkpoint model
 */
export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  estimatedDays?: number;
  tasks?: Task[];
  completed?: boolean;
}

/**
 * Checkpoint with full task details
 */
export interface CheckpointDetail extends Checkpoint {
  tasks: Task[];
  completedAt?: string;
}

/**
 * Learning path progress stats
 */
export interface LearningPathProgress {
  total: number;
  completed: number;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  status?: string;
}

/**
 * Task completion request payload
 */
export interface TaskCompletionRequest {
  checkpointId: string;
  taskId: string;
  completed: boolean;
}

/**
 * Task completion response
 */
export interface TaskCompletionResponse {
  message: string;
  progress: LearningPathProgress;
}

/**
 * Learning path model
 */
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

/**
 * Create learning path request payload
 */
export interface CreateLearningPathRequest {
  user_level: string;
  experience: string;
  known_technologies: string[];
  weekly_hours: number;
  learning_style: string;
  target_role: string;
  specific_focus: string;
  timeline_months: number;
  career_objective: string;
  number_of_checkpoints: number;
  tasks_per_checkpoint: number;
  include_capstone: boolean;
  generation_mode: string;
  test_results: Record<string, unknown> | null;
  avoid_technologies: string[];
  preferred_resources: string[];
}

/**
 * Create learning path response
 */
export interface CreateLearningPathResponse {
  id: string;
  title: string;
  message: string;
  status: string;
}

/**
 * Result type for hook operations
 */
export interface LearningPathResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create learning path result
 */
export interface CreateLearningPathResult extends LearningPathResult<CreateLearningPathResponse> {}

/**
 * Update task result
 */
export interface UpdateTaskResult extends LearningPathResult<TaskCompletionResponse> {}
