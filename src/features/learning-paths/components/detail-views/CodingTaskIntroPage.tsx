import { memo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import { useGetCodingTaskQuery } from "../../api/learningPathsApi";
import type { CodeItem } from "../../services/type";
import { Spinner } from "@/components/ui/spinner";

// ============================================================================
// Icons
// ============================================================================

const CodeIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
));
CodeIcon.displayName = "CodeIcon";

const PlayIcon = memo(() => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
));
PlayIcon.displayName = "PlayIcon";

const CheckCircleIcon = memo(() => (
  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
));
CheckCircleIcon.displayName = "CheckCircleIcon";

const ClockIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
));
ClockIcon.displayName = "ClockIcon";

const BookOpenIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
));
BookOpenIcon.displayName = "BookOpenIcon";

const TerminalIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
));
TerminalIcon.displayName = "TerminalIcon";

const CubeIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
));
CubeIcon.displayName = "CubeIcon";

// ============================================================================
// Sub-components
// ============================================================================

interface LanguageBadgeProps {
  language: string;
}

const LanguageBadge = memo(({ language }: LanguageBadgeProps) => {
  const colorMap: Record<string, string> = {
    python: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    javascript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    typescript: "bg-blue-600/20 text-blue-300 border-blue-600/30",
    "c#": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    csharp: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    java: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    go: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    rust: "bg-orange-600/20 text-orange-300 border-orange-600/30",
  };

  const colorClass = colorMap[language.toLowerCase()] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
      <CodeIcon />
      {language}
    </span>
  );
});
LanguageBadge.displayName = "LanguageBadge";

interface DefinitionOfDoneListProps {
  items: string[];
}

const DefinitionOfDoneList = memo(({ items }: DefinitionOfDoneListProps) => (
  <div className="space-y-3">
    {items.map((item, index) => (
      <div
        key={index}
        className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50 hover:border-green-500/30 transition-colors"
      >
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
          {index + 1}
        </div>
        <span className="text-zinc-300 text-sm leading-relaxed">{item}</span>
      </div>
    ))}
  </div>
));
DefinitionOfDoneList.displayName = "DefinitionOfDoneList";

interface DependencyTagsProps {
  dependencies: string[];
}

const DependencyTags = memo(({ dependencies }: DependencyTagsProps) => (
  <div className="flex flex-wrap gap-2">
    {dependencies.map((dep, index) => (
      <code
        key={index}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-amber-500/50 transition-colors"
      >
        <CubeIcon />
        {dep}
      </code>
    ))}
  </div>
));
DependencyTags.displayName = "DependencyTags";

// ============================================================================
// Main Component
// ============================================================================

export interface CodingTaskIntroPageProps {
  item: CodeItem;
}

export const CodingTaskIntroPage = memo(({ item }: CodingTaskIntroPageProps) => {
  const navigate = useNavigate();
  const { id: learningPathId } = useParams<{ id: string }>();
  const [isStarting, setIsStarting] = useState(false);

  // Fetch detailed task data
  const {
    data: codingTask,
    isLoading,
    error,
  } = useGetCodingTaskQuery(
    { learningPathId: learningPathId!, itemId: item.id },
    { skip: !learningPathId }
  );

  // Handle "Start Task" button - navigate to IDE page
  const handleStartTask = useCallback(async () => {
    setIsStarting(true);
    try {
      // Navigate to IDE page - container will be provisioned there
      navigate(`/learning-paths/${learningPathId}/tasks/${item.id}/ide`, {
        state: {
          item,
          codingTask,
        },
      });
    } catch (err) {
      console.error("Failed to start task:", err);
      setIsStarting(false);
    }
  }, [navigate, learningPathId, item, codingTask]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-zinc-400">Завантаження завдання...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Помилка завантаження</h3>
          <p className="text-zinc-400 text-sm">Не вдалося завантажити деталі завдання. Спробуйте пізніше.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-zinc-800/25 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <TerminalIcon />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Практичне завдання
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4 leading-tight">
                {item.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <LanguageBadge language={item.programmingLanguage} />
                {codingTask?.estimatedTimeMinutes && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm text-zinc-400 bg-zinc-800/50 border border-zinc-700/50">
                    <ClockIcon />
                    ~{codingTask.estimatedTimeMinutes} хв
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Start Button - Prominent CTA */}
          <button
            onClick={handleStartTask}
            disabled={isStarting}
            className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300
              bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400
              text-zinc-900 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-3"
          >
            {isStarting ? (
              <>
                <Spinner size="sm" className="text-zinc-900" />
                <span>Підготовка середовища...</span>
              </>
            ) : (
              <>
                <PlayIcon />
                <span>Почати виконання</span>
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
        {/* Task Description */}
        {codingTask?.description && (
          <section className="rounded-2xl bg-zinc-800/30 border border-zinc-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-700/50 flex items-center gap-3">
              <BookOpenIcon />
              <h2 className="text-lg font-semibold text-zinc-200">Опис завдання</h2>
            </div>
            <div className="p-6">
              <div className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-300 prose-headings:text-zinc-200 prose-code:text-amber-400 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                <Markdown>{codingTask.description}</Markdown>
              </div>
            </div>
          </section>
        )}

        {/* Definition of Done */}
        {codingTask?.definitionOfDone && codingTask.definitionOfDone.length > 0 && (
          <section className="rounded-2xl bg-zinc-800/30 border border-zinc-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-700/50 flex items-center gap-3">
              <CheckCircleIcon />
              <h2 className="text-lg font-semibold text-zinc-200">Критерії виконання</h2>
              <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                {codingTask.definitionOfDone.length} критеріїв
              </span>
            </div>
            <div className="p-6">
              <DefinitionOfDoneList items={codingTask.definitionOfDone} />
            </div>
          </section>
        )}

        {/* Dependencies */}
        {codingTask?.dependencies && codingTask.dependencies.length > 0 && (
          <section className="rounded-2xl bg-zinc-800/30 border border-zinc-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-700/50 flex items-center gap-3">
              <CubeIcon />
              <h2 className="text-lg font-semibold text-zinc-200">Необхідні бібліотеки</h2>
              <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                Будуть встановлені автоматично
              </span>
            </div>
            <div className="p-6">
              <DependencyTags dependencies={codingTask.dependencies} />
            </div>
          </section>
        )}

        {/* Environment Info */}
        <section className="rounded-2xl bg-gradient-to-r from-zinc-800/50 to-zinc-800/30 border border-zinc-700/50 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-zinc-700/50">
              <TerminalIcon />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">Хмарне середовище</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Для виконання завдання буде запущено ізольований Docker контейнер з попередньо налаштованим середовищем.
                Ви матимете доступ до VS Code-подібного редактора коду та інтерактивного терміналу.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

CodingTaskIntroPage.displayName = "CodingTaskIntroPage";
