import { memo } from "react";
import type { QuizItem } from "../../services/type";

// ============================================================================
// Icon Components
// ============================================================================

const QuizIcon = memo(() => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
));
QuizIcon.displayName = "QuizIcon";

// ============================================================================
// Main Component
// ============================================================================

export interface QuizDetailProps {
  item: QuizItem;
}

/**
 * Detail view component for Quiz learning items.
 * Quiz functionality is currently under development.
 */
export const QuizDetail = memo(({ item }: QuizDetailProps) => {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <QuizIcon />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Quiz
            </span>
            <div className="text-sm text-muted-foreground mt-0.5">
              {item.questionsCount} питань{item.questionsCount !== 1 ? "" : "ня"}
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-6">{item.title}</h2>

        {/* Under Development Notice */}
        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-8 text-center border border-purple-200 dark:border-purple-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <span className="text-4xl">🚧</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">В процесі розробки</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Функціонал квізів зараз в активній розробці. Незабаром тут з'являться інтерактивні питання з відповідями.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Очікується в наступному оновленні
          </div>
        </div>
      </div>
    </div>
  );
});

QuizDetail.displayName = "QuizDetail";
