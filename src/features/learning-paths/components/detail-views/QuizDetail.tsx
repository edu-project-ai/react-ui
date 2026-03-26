import { memo, useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { QuizAttemptSummary, QuizItem } from "../../services/type";
import {
  useGetQuizQuery,
  useGetLatestQuizAttemptQuery,
  useSaveQuizAttemptMutation,
  useSubmitQuizAnswerMutation,
  useUpdateTaskCompletionMutation,
  useRequestQuizHelpMutation,
} from "../../api/learningPathsApi";
import { AgentHelpModal } from "../AgentHelpModal";

// ============================================================================
// Types
// ============================================================================

type QuizPhase = "intro" | "question" | "results";

interface QuestionAttempt {
  questionId: string;
  questionText: string;
  questionType: 'single_choice' | 'multiple_choice' | 'text_input';
  options: Record<string, string>;
  isCorrect: boolean;
  correctAnswerIndex: number;
  correctAnswerIndices: number[] | null;
  explanation: string | null;
  userAnswerIndex?: number | null;
  userAnswerIndices?: number[] | null;
  userTextAnswer?: string | null;
}

// ============================================================================
// Helpers
// ============================================================================

function parseOptions(options: Record<string, string>): string[] {
  return Object.keys(options)
    .sort()
    .map((key) => options[key]);
}

function getScoreLabel(percentage: number): string {
  if (percentage >= 80) return "Excellent!";
  if (percentage >= 60) return "Good!";
  return "Needs Review";
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600 dark:text-green-400";
  if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

// ============================================================================
// Icon Components
// ============================================================================

const QuizIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
));
QuizIcon.displayName = "QuizIcon";

const CheckCircleIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
));
CheckCircleIcon.displayName = "CheckCircleIcon";

const XCircleIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
));
XCircleIcon.displayName = "XCircleIcon";

// ============================================================================
// Intro View
// ============================================================================

interface IntroViewProps {
  title: string;
  questionsCount: number;
  previousResult?: QuizAttemptSummary | null;
  isCompleted: boolean;
  onStart: () => void;
  onRequestPreviousHelp?: () => void;
  isHelpLoading: boolean;
}

const IntroView = memo(({
  title,
  questionsCount,
  previousResult,
  isCompleted,
  onStart,
  onRequestPreviousHelp,
  isHelpLoading,
}: IntroViewProps) => (
  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <QuizIcon />
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Quiz
          </span>
          <div className="text-sm text-muted-foreground mt-0.5">
            {questionsCount} questions
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-8">{title}</h2>

      {/* Previous result */}
      {previousResult && (
        <div className={`rounded-lg p-4 border mb-6 ${
          previousResult.percentage >= 80
            ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
            : "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Previous Result</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(previousResult.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${getScoreColor(previousResult.percentage)}`}>
                {previousResult.correctAnswers}/{previousResult.totalQuestions}
              </p>
              <p className="text-xs text-muted-foreground">{previousResult.percentage}%</p>
            </div>
          </div>
          {isCompleted && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircleIcon />
              <span>Completed</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-6 border border-purple-200 dark:border-purple-800 mb-8">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
            Questions can be single choice, multiple choice, or text input
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
            After selecting, click "Confirm" to submit your answer
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
            Results are shown after each answer. Score 80%+ to auto-complete.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onStart}
          className="w-full py-3 px-6 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow transition-colors"
        >
          {previousResult ? "Retry Quiz" : "Start Quiz"}
        </button>
        {previousResult && previousResult.percentage < 80 && onRequestPreviousHelp && (
          <button
            type="button"
            onClick={onRequestPreviousHelp}
            disabled={isHelpLoading}
            className="w-full py-3 px-6 rounded-lg font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow transition-colors"
          >
            {isHelpLoading ? "Asking AI..." : "Get AI Help For Last Attempt"}
          </button>
        )}
      </div>
    </div>
  </div>
));
IntroView.displayName = "IntroView";

// ============================================================================
// Question View
// ============================================================================

interface QuestionViewProps {
  questionText: string;
  questionType: 'single_choice' | 'multiple_choice' | 'text_input';
  options: string[];
  currentIndex: number;
  total: number;
  selectedOption: number | null;
  selectedOptions: Set<number>;
  textAnswer: string;
  submittedAttempt: QuestionAttempt | null;
  isSubmitting: boolean;
  isLastQuestion: boolean;
  onSelectOption: (index: number) => void;
  onToggleOption: (index: number) => void;
  onTextChange: (value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}

const QuestionView = memo(
  ({
    questionText,
    questionType,
    options,
    currentIndex,
    total,
    selectedOption,
    selectedOptions,
    textAnswer,
    submittedAttempt,
    isSubmitting,
    isLastQuestion,
    onSelectOption,
    onToggleOption,
    onTextChange,
    onSubmit,
    onNext,
  }: QuestionViewProps) => {
    const progressPct = (currentIndex / total) * 100;
    const isAnswered = submittedAttempt !== null;

    const isSubmitDisabled = isAnswered || isSubmitting || (
      questionType === 'single_choice' ? selectedOption === null :
      questionType === 'multiple_choice' ? selectedOptions.size === 0 :
      textAnswer.trim().length === 0
    );

    return (
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentIndex + 1} of {total}</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Question type badge */}
          {questionType === 'multiple_choice' && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                Select all correct answers
              </span>
            </div>
          )}
          {questionType === 'text_input' && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                Enter your answer as text
              </span>
            </div>
          )}

          {/* Question */}
          <h3 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
            {questionText}
          </h3>

          {/* Answer input area */}
          {questionType === 'text_input' ? (
            <div className="mb-6">
              <textarea
                rows={3}
                value={textAnswer}
                onChange={(e) => onTextChange(e.target.value)}
                disabled={isAnswered}
                placeholder="Enter your answer..."
                className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-purple-500 focus:outline-none bg-background text-foreground text-sm resize-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          ) : questionType === 'multiple_choice' ? (
            <div className="space-y-3 mb-6">
              {options.map((option, index) => {
                const isSelected = selectedOptions.has(index);
                const correctSet = new Set(submittedAttempt?.correctAnswerIndices ?? []);
                const isCorrectAnswer = isAnswered && correctSet.has(index);
                const isWrongSelected = isAnswered && isSelected && !correctSet.has(index);

                let cardClass =
                  "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ";

                if (!isAnswered) {
                  cardClass += isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-border bg-background hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 text-foreground cursor-pointer";
                } else if (isCorrectAnswer) {
                  cardClass +=
                    "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                } else if (isWrongSelected) {
                  cardClass +=
                    "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                } else {
                  cardClass +=
                    "border-border bg-muted/30 text-muted-foreground opacity-60";
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={cardClass}
                    onClick={() => !isAnswered && onToggleOption(index)}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded border-2 border-current flex items-center justify-center text-xs font-bold transition-colors ${isSelected && !isAnswered ? "bg-blue-500 text-white border-blue-500" : ""}`}>
                        {isSelected ? "✓" : ""}
                      </span>
                      <span>{option}</span>
                      {isAnswered && isCorrectAnswer && (
                        <span className="ml-auto text-green-600 dark:text-green-400">
                          <CheckCircleIcon />
                        </span>
                      )}
                      {isAnswered && isWrongSelected && (
                        <span className="ml-auto text-red-600 dark:text-red-400">
                          <XCircleIcon />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* single_choice */
            <div className="space-y-3 mb-6">
              {options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectAnswer =
                  isAnswered && index === submittedAttempt!.correctAnswerIndex;
                const isWrongSelected =
                  isAnswered && isSelected && !submittedAttempt!.isCorrect;

                let cardClass =
                  "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ";

                if (!isAnswered) {
                  cardClass += isSelected
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                    : "border-border bg-background hover:border-purple-300 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 text-foreground cursor-pointer";
                } else if (isCorrectAnswer) {
                  cardClass +=
                    "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                } else if (isWrongSelected) {
                  cardClass +=
                    "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                } else {
                  cardClass +=
                    "border-border bg-muted/30 text-muted-foreground opacity-60";
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={cardClass}
                    onClick={() => !isAnswered && onSelectOption(index)}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {isAnswered && isCorrectAnswer && (
                        <span className="ml-auto text-green-600 dark:text-green-400">
                          <CheckCircleIcon />
                        </span>
                      )}
                      {isAnswered && isWrongSelected && (
                        <span className="ml-auto text-red-600 dark:text-red-400">
                          <XCircleIcon />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Feedback */}
          {submittedAttempt && (
            <div
              className={`rounded-lg p-4 mb-6 border ${
                submittedAttempt.isCorrect
                  ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={
                    submittedAttempt.isCorrect
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {submittedAttempt.isCorrect ? <CheckCircleIcon /> : <XCircleIcon />}
                </span>
                <span
                  className={`font-semibold text-sm ${
                    submittedAttempt.isCorrect
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {submittedAttempt.isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>
              {submittedAttempt.explanation && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {submittedAttempt.explanation}
                </p>
              )}
            </div>
          )}

          {/* Action button */}
          {!submittedAttempt ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className="w-full py-3 px-6 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Checking...
                </>
              ) : (
                "Confirm Answer"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="w-full py-3 px-6 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow transition-colors"
            >
              {isLastQuestion ? "View Results" : "Next Question"}
            </button>
          )}
        </div>
      </div>
    );
  }
);
QuestionView.displayName = "QuestionView";

// ============================================================================
// Results View
// ============================================================================

interface ResultsViewProps {
  quizTitle: string;
  attempts: QuestionAttempt[];
  questions: Array<{ id: string; questionText: string }>;
  isCompleted: boolean;
  onRetry: () => void;
  onRequestHelp: () => void;
  isHelpLoading: boolean;
}

const ResultsView = memo(
  ({
    quizTitle,
    attempts,
    questions,
    isCompleted,
    onRetry,
    onRequestHelp,
    isHelpLoading,
  }: ResultsViewProps) => {
    const correct = attempts.filter((a) => a.isCorrect).length;
    const total = attempts.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <QuizIcon />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Results
            </span>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-6">{quizTitle}</h2>

          {/* Score */}
          <div className="text-center py-6 mb-6 bg-muted/30 rounded-lg border border-border">
            <div className={`text-5xl font-bold mb-1 ${getScoreColor(percentage)}`}>
              {correct} / {total}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              {percentage}% correct answers
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                percentage >= 80
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : percentage >= 60
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {getScoreLabel(percentage)}
            </span>
          </div>

          {/* Question breakdown */}
          <div className="space-y-2 mb-6">
            {questions.map((q, idx) => {
              const attempt = attempts.find((a) => a.questionId === q.id);
              return (
                <div
                  key={q.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border"
                >
                  <span
                    className={`flex-shrink-0 mt-0.5 ${
                      attempt?.isCorrect
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {attempt?.isCorrect ? <CheckCircleIcon /> : <XCircleIcon />}
                  </span>
                  <span className="text-sm text-foreground leading-relaxed">
                    <span className="font-medium text-muted-foreground mr-1">
                      {idx + 1}.
                    </span>
                    {q.questionText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 py-3 px-6 rounded-lg font-semibold border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              Retry Quiz
            </button>
            {percentage < 80 && (
              <button
                type="button"
                onClick={onRequestHelp}
                disabled={isHelpLoading}
                className="flex-1 py-3 px-6 rounded-lg font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow transition-colors flex items-center justify-center gap-2"
              >
                {isHelpLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Asking AI...
                  </>
                ) : (
                  "Get AI Help"
                )}
              </button>
            )}
            {isCompleted ? (
              <div className="flex-1 py-3 px-6 rounded-lg font-semibold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 flex items-center justify-center gap-2 border border-green-200 dark:border-green-800">
                <CheckCircleIcon />
                Completed
              </div>
            ) : percentage >= 80 ? (
              <div className="flex-1 py-3 px-6 rounded-lg font-semibold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 flex items-center justify-center gap-2 border border-green-200 dark:border-green-800">
                <CheckCircleIcon />
                Auto-completed (80%+)
              </div>
            ) : (
              <div className="flex-1 py-3 px-6 rounded-lg font-semibold bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 flex items-center justify-center gap-2 border border-yellow-200 dark:border-yellow-800 text-sm">
                Score 80% or higher to complete
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
ResultsView.displayName = "ResultsView";

// ============================================================================
// Main Component
// ============================================================================

export interface QuizDetailProps {
  item: QuizItem;
}

export const QuizDetail = memo(({ item }: QuizDetailProps) => {
  const { id: learningPathId } = useParams<{ id: string }>();

  const { data: quiz, isLoading, error } = useGetQuizQuery(
    { learningPathId: learningPathId!, itemId: item.id },
    { skip: !learningPathId }
  );
  const { data: previousResult } = useGetLatestQuizAttemptQuery(
    { learningPathId: learningPathId!, itemId: item.id },
    { skip: !learningPathId }
  );

  const [submitAnswer, { isLoading: isSubmitting }] = useSubmitQuizAnswerMutation();
  const [saveQuizAttempt] = useSaveQuizAttemptMutation();
  const [updateCompletion] = useUpdateTaskCompletionMutation();
  const [requestQuizHelp, { isLoading: isHelpLoading }] = useRequestQuizHelpMutation();

  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const [textAnswer, setTextAnswer] = useState("");
  const [submittedAttempt, setSubmittedAttempt] = useState<QuestionAttempt | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpOutput, setHelpOutput] = useState<string | null>(null);
  const [helpError, setHelpError] = useState(false);

  // Auto-complete when phase changes to results and score >= 80%
  useEffect(() => {
    if (phase === "results" && attempts.length > 0) {
      const correct = attempts.filter((a) => a.isCorrect).length;
      const total = attempts.length;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      // Auto-complete at >= 80%
      if (percentage >= 80 && !item.isCompleted && learningPathId) {
        updateCompletion({
          learningPathId,
          itemId: item.id,
          data: { completed: true },
        });
      }
    }
  }, [phase, attempts, item.id, item.isCompleted, learningPathId, updateCompletion]);

  const persistQuizAttempt = useCallback(async (attemptList: QuestionAttempt[]) => {
    if (!learningPathId || attemptList.length === 0) {
      return;
    }

    try {
      await saveQuizAttempt({
        learningPathId,
        itemId: item.id,
        data: {
          questions: attemptList.map((attempt) => ({
            questionId: attempt.questionId,
            questionText: attempt.questionText,
            questionType: attempt.questionType,
            options: attempt.options,
            userAnswerIndex: attempt.userAnswerIndex ?? null,
            userAnswerIndices: attempt.userAnswerIndices ?? null,
            userTextAnswer: attempt.userTextAnswer ?? null,
            correctAnswerIndex: attempt.correctAnswerIndex,
            correctAnswerIndices: attempt.correctAnswerIndices,
            explanation: attempt.explanation,
            isCorrect: attempt.isCorrect,
          })),
        },
      }).unwrap();
    } catch {
      // Saving attempts should not block quiz flow.
    }
  }, [item.id, learningPathId, saveQuizAttempt]);

  const handleStart = useCallback(() => {
    setPhase("question");
    setCurrentIndex(0);
    setAttempts([]);
    setSelectedOption(null);
    setSelectedOptions(new Set());
    setTextAnswer("");
    setSubmittedAttempt(null);
  }, []);

  const handleSelectOption = useCallback((index: number) => {
    setSelectedOption(index);
  }, []);

  const handleToggleOption = useCallback((index: number) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleTextChange = useCallback((value: string) => {
    setTextAnswer(value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !learningPathId) return;

    const sorted = [...quiz.questions].sort((a, b) => a.order - b.order);
    const question = sorted[currentIndex];
    if (!question) return;

    const payload =
      question.questionType === "multiple_choice"
        ? { questionId: question.id, selectedAnswerIndices: [...selectedOptions] }
        : question.questionType === "text_input"
        ? { questionId: question.id, textAnswer }
        : { questionId: question.id, selectedAnswerIndex: selectedOption! };

    try {
      const result = await submitAnswer({
        learningPathId,
        itemId: item.id,
        data: payload,
      }).unwrap();

      const userAnswerIndex =
        question.questionType === "single_choice" ? (selectedOption ?? -1) : -1;

      const attempt: QuestionAttempt = {
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        isCorrect: result.isCorrect,
        correctAnswerIndex: result.correctAnswerIndex,
        correctAnswerIndices: result.correctAnswerIndices ?? null,
        explanation: result.explanation,
        userAnswerIndex: question.questionType === "single_choice" ? userAnswerIndex : null,
        userAnswerIndices: question.questionType === "multiple_choice" ? [...selectedOptions] : null,
        userTextAnswer: question.questionType === "text_input" ? textAnswer : null,
      };
      setSubmittedAttempt(attempt);
      setAttempts((prev) => [...prev, attempt]);
    } catch {
      // keep state so user can retry submit
    }
  }, [quiz, selectedOption, selectedOptions, textAnswer, currentIndex, submitAnswer, learningPathId, item.id]);

  const handleNext = useCallback(() => {
    if (!quiz) return;
    const sorted = [...quiz.questions].sort((a, b) => a.order - b.order);
    if (currentIndex < sorted.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSelectedOptions(new Set());
      setTextAnswer("");
      setSubmittedAttempt(null);
    } else {
      void persistQuizAttempt(attempts);
      setPhase("results");
    }
  }, [attempts, currentIndex, persistQuizAttempt, quiz]);

  const handleRetry = useCallback(() => {
    setPhase("intro");
    setCurrentIndex(0);
    setAttempts([]);
    setSelectedOption(null);
    setSelectedOptions(new Set());
    setTextAnswer("");
    setSubmittedAttempt(null);
  }, []);

  const handleRequestHelp = useCallback(async () => {
    if (!learningPathId) return;
    setHelpOutput(null);
    setHelpError(false);
    setHelpModalOpen(true);
    try {
      if (attempts.length > 0) {
        await persistQuizAttempt(attempts);
      }

      const response = await requestQuizHelp({ learningPathId, itemId: item.id }).unwrap();
      setHelpOutput(response.agentOutput);
    } catch {
      setHelpError(true);
    }
  }, [attempts, item.id, learningPathId, persistQuizAttempt, requestQuizHelp]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-8">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-8">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Failed to load quiz.</p>
          <p className="text-xs text-muted-foreground">Try refreshing the page</p>
        </div>
      </div>
    );
  }

  const sortedQuestions = [...quiz.questions].sort((a, b) => a.order - b.order);
  const currentQuestion = sortedQuestions[currentIndex];
  const currentOptions = parseOptions(currentQuestion?.options ?? {});

  if (phase === "intro") {
    return (
      <>
        <IntroView
          title={quiz.title}
          questionsCount={sortedQuestions.length}
          previousResult={previousResult}
          isCompleted={item.isCompleted}
          onStart={handleStart}
          onRequestPreviousHelp={handleRequestHelp}
          isHelpLoading={isHelpLoading}
        />
        <AgentHelpModal
          isOpen={helpModalOpen}
          isLoading={isHelpLoading}
          agentOutput={helpOutput}
          error={helpError}
          onClose={() => setHelpModalOpen(false)}
        />
      </>
    );
  }

  if (phase === "question" && currentQuestion) {
    return (
      <QuestionView
        questionText={currentQuestion.questionText}
        questionType={currentQuestion.questionType}
        options={currentOptions}
        currentIndex={currentIndex}
        total={sortedQuestions.length}
        selectedOption={selectedOption}
        selectedOptions={selectedOptions}
        textAnswer={textAnswer}
        submittedAttempt={submittedAttempt}
        isSubmitting={isSubmitting}
        isLastQuestion={currentIndex === sortedQuestions.length - 1}
        onSelectOption={handleSelectOption}
        onToggleOption={handleToggleOption}
        onTextChange={handleTextChange}
        onSubmit={handleSubmit}
        onNext={handleNext}
      />
    );
  }

  return (
    <>
      <ResultsView
        quizTitle={quiz.title}
        attempts={attempts}
        questions={sortedQuestions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
        }))}
        isCompleted={item.isCompleted}
        onRetry={handleRetry}
        onRequestHelp={handleRequestHelp}
        isHelpLoading={isHelpLoading}
      />
      <AgentHelpModal
        isOpen={helpModalOpen}
        isLoading={isHelpLoading}
        agentOutput={helpOutput}
        error={helpError}
        onClose={() => setHelpModalOpen(false)}
      />
    </>
  );
});

QuizDetail.displayName = "QuizDetail";
