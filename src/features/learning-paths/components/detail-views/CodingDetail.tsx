import { memo } from "react";
import { useParams } from "react-router-dom";
import { useGetCodingTaskQuery } from "../../api/learningPathsApi";
import type { CodeItem } from "../../services/type";
import { Terminal } from "@/features/ide/components/terminal";

const CodeIcon = memo(() => (
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
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
));
CodeIcon.displayName = "CodeIcon";

const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

export interface CodingDetailProps {
  item: CodeItem;
}

export const CodingDetail = memo(({ item }: CodingDetailProps) => {
  const { id: learningPathId } = useParams<{ id: string }>();

  const {
    data: codingTask,
    isLoading: isLoadingTask,
    error: taskError,
  } = useGetCodingTaskQuery(
    { learningPathId: learningPathId!, itemId: item.id },
    { skip: !learningPathId }
  );

  // TERMINAL TEST MODE - Remove/Comment this section once Monaco Editor is ready
  // For now, we show ONLY the terminal to test the backend connection
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden h-screen">
      {/* Terminal Test Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <CodeIcon />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
            <span className="text-xs text-muted-foreground">
              Testing Interactive Session: {item.programmingLanguage}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Container with Height */}
      <div className="relative" style={{ height: 'calc(100vh - 120px)' }}>
        {isLoadingTask ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground">
                Loading task details...
              </p>
            </div>
          </div>
        ) : taskError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <p className="text-sm text-destructive">
                Failed to load coding task details. Please try again.
              </p>
            </div>
          </div>
        ) : codingTask?.id ? (
          // New WebSocket terminal — connects directly to Go proxy
          <Terminal taskId={codingTask.id} />
        ) : null}
      </div>
    </div>
  );

  /* COMMENTED OUT: Original task description view - restore when adding Monaco Editor
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Header *\/}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <CodeIcon />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Coding Task
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-medium text-foreground">
                  {item.programmingLanguage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Title *\/}
        <h2 className="text-2xl font-bold text-foreground mb-6">{item.title}</h2>

        {/* Loading State *\/}
        {isLoading && (
          <div className="bg-muted/30 rounded-lg p-8 text-center border border-dashed border-border animate-pulse">
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        )}

        {/* Error State *\/}
        {error && (
          <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
            <p className="text-destructive text-sm">
              Failed to load coding task details. Please try again.
            </p>
          </div>
        )}

        {codingTask && (
          <div className="space-y-6">
            <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-semibold text-foreground mb-3">Опис завдання</h3>
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                <Markdown>{codingTask.description}</Markdown>
              </div>
            </div>

            {codingTask.definitionOfDone && codingTask.definitionOfDone.length > 0 && (
              <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-foreground mb-3">Критерії виконання</h3>
                <ul className="space-y-2">
                  {codingTask.definitionOfDone.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {codingTask.dependencies && codingTask.dependencies.length > 0 && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-foreground mb-3">Необхідні бібліотеки</h3>
                <div className="flex flex-wrap gap-2">
                  {codingTask.dependencies.map((dep, index) => (
                    <code
                      key={index}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                    >
                      {dep}
                    </code>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/30 rounded-lg border border-dashed border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground">
                  {item.programmingLanguage.toLowerCase()}.code
                </span>
              </div>
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-2">
                  <span className="text-lg">🚧</span> Редактор коду в процесі розробки
                </p>
                <p className="text-xs text-muted-foreground">
                  Незабаром тут буде інтерактивний редактор для написання та тестування коду
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  */
});

CodingDetail.displayName = "CodingDetail";
