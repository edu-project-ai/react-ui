/**
 * Learning Item model (replaces Task)
 */
export interface LearningItem {
  id: string;
  checkpointId: string;
  title: string;
  type: string; // "Theory" | "Code" | "Quiz"
  order: number;
  isCompleted: boolean;
  estimatedTime: number;
}

/**
 * Task model (deprecated - use LearningItem)
 * @deprecated Use LearningItem instead
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
  learningPathId: string;
  order: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  items: LearningItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Checkpoint Preview (used in learning path list)
 */
export interface CheckpointPreview {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
}

/**
 * Checkpoint with full task details
 * @deprecated Use Checkpoint instead (it now includes items by default)
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
  userId: string;
  title: string;
  description: string | null;
  goal: string | null;
  difficultyLevel: string;
  estimatedDays: number | null;
  correlationId: string | null;
  checkpoints: CheckpointPreview[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  totalCheckpoints?: number;
  progressPercentage?: number;
  progress?: LearningPathProgress;
}

/**
 * Create learning path request payload
 */
export interface CreateLearningPathRequest {
  userLevel: string;
  experience: string;
  knownTechnologies: string[];
  weeklyHours: number;
  learningStyle: string;
  targetRole: string;
  specificFocus: string;
  timelineMonths: number;
  careerObjective: string;
  numberOfCheckpoints: number;
  tasksPerCheckpoint: number;
  includeCapstone: boolean;
  generationMode: string;
  testResults: Record<string, unknown> | null;
  avoidTechnologies: string[];
  preferredResources: string[];
  theoryItemsPerCheckpoint: number;
  codeItemsPerCheckpoint: number;
  quizItemsPerCheckpoint: number;
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
export type CreateLearningPathResult = LearningPathResult<CreateLearningPathResponse>;

/**
 * Update task result
 */
export type UpdateTaskResult = LearningPathResult<TaskCompletionResponse>;
