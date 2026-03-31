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
  itemId: string;
  completed: boolean;
  completionPercentage: number;
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
  generationStatus?: string;
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Text input validation config (for text_input question type)
 */
export interface TextInputValidation {
  strategy: 'exact_match' | 'fuzzy_match' | 'regex';
  accepted_answers: string[];
}

/**
 * Quiz Question (single question with options)
 */
export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'single_choice' | 'multiple_choice' | 'text_input';
  options: Record<string, string>;
  correctAnswerIndices: number[] | null;
  validation: TextInputValidation | null;
  explanation: string | null;
  order: number;
}

/**
 * Quiz Detail (for lazy loading)
 */
export interface QuizDetail {
  id: string;
  learningItemId: string;
  title: string;
  questions: QuizQuestion[];
}

/**
 * Quiz answer submission request
 */
export interface QuizSubmitRequest {
  questionId: string;
  selectedAnswerIndex?: number;
  selectedAnswerIndices?: number[];
  textAnswer?: string;
}

/**
 * Quiz answer submission result
 */
export interface QuizSubmitResult {
  isCorrect: boolean;
  correctAnswerIndex: number;
  correctAnswerIndices: number[] | null;
  explanation: string | null;
}

export interface QuizQuestionAttempt {
  questionId: string;
  questionText: string;
  questionType: 'single_choice' | 'multiple_choice' | 'text_input';
  options: Record<string, string>;
  userAnswerIndex?: number | null;
  userAnswerIndices?: number[] | null;
  userTextAnswer?: string | null;
  correctAnswerIndex: number;
  correctAnswerIndices: number[] | null;
  explanation: string | null;
  isCorrect: boolean;
}

export interface SaveQuizAttemptRequest {
  questions: QuizQuestionAttempt[];
}

export interface QuizAttemptSummary {
  id: string;
  learningItemId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
}

/**
 * Agent interaction response from the AI help endpoints
 */
export interface AgentInteractionResponse {
  id: string;
  triggerType: 'QuizHelp' | 'TheoryHelp';
  agentOutput: string;
  quizScore?: number | null;
  userQuestion?: string | null;
  createdAt: string;
}

/**
 * Request payload for theory help
 */
export interface RequestTheoryHelpRequest {
  userQuestion: string;
}

/**
 * Resource linked to a theory learning item
 */
export interface ResourceItem {
  id: string;
  title: string;
  type: string;
  url: string | null;
  content: string | null;
  language: string | null;
  difficultyLevel: string | null;
  tags: string[];
  estimatedReadTime: number | null;
  createdAt: string;
  updatedAt: string;
}
