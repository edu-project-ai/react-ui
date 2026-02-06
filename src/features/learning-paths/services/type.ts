/**
 * Discriminator type for polymorphic learning items.
 * MUST match Backend [JsonDerivedType] discriminators exactly.
 */
export type LearningItemType = 'Theory' | 'CodingTask' | 'Quiz';

/**
 * Base shared fields for all learning item types
 */
export interface BaseLearningItem {
  id: string;
  checkpointId: string;
  title: string;
  order: number;
  isCompleted: boolean;
}

/**
 * Theory item - reading/learning content
 */
export interface TheoryItem extends BaseLearningItem {
  type: 'Theory';
  summary: string | null;
}

/**
 * Coding task item - programming exercises
 */
export interface CodeItem extends BaseLearningItem {
  type: 'CodingTask';
  programmingLanguage: string;
}

/**
 * Quiz item - assessment questions
 */
export interface QuizItem extends BaseLearningItem {
  type: 'Quiz';
  questionsCount: number;
}

/**
 * Discriminated union type for all learning items
 */
export type LearningItem = TheoryItem | CodeItem | QuizItem;

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

/**
 * Theory Resource Detail (for lazy loading)
 */
export interface TheoryResourceDetail {
  id: string;
  learningItemId: string;
  content: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Coding Task Detail (for lazy loading)
 */
export interface CodingTaskDetail {
  id: string;
  learningItemId: string;
  description: string;
  language: string;
  initialCodeTemplate: string | null;
  definitionOfDone: string[] | null;
  validationType: string;
  dependencies: string[];
  estimatedTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Quiz Detail (for lazy loading)
 */
export interface QuizDetail {
  id: string;
  learningItemId: string;
  question: string;
  options: string[];
}

