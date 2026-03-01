import { memo } from "react";
import Markdown from 'react-markdown'
import { useParams, useNavigate } from "react-router-dom";
import { useGetCodingTaskQuery } from "../../api/learningPathsApi";
import type { CodeItem } from "../../services/type";

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
  const navigate = useNavigate();

  const {
    data: codingTask,
    isLoading: isLoadingTask,
    error: taskError,
  } = useGetCodingTaskQuery(
    { learningPathId: learningPathId!, itemId: item.id },
    { skip: !learningPathId }
  );

  const handleOpenWorkspace = () => {
    if (learningPathId) {
      navigate(`/workspace/${learningPathId}/${item.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <CodeIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
              <span className="text-sm text-muted-foreground">
                {item.programmingLanguage}
              </span>
            </div>
          </div>

          {/* Task description */}
          {isLoadingTask ? (
            <div className="py-8">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground text-center mt-3">
                Loading task details...
              </p>
            </div>
          ) : taskError ? (
            <p className="text-sm text-destructive">
              Failed to load coding task details. Please try again.
            </p>
          ) : codingTask?.description ? (
            <div className="p-4 overflow-y-auto h-full">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <Markdown>{codingTask.description}</Markdown>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Open IDE button */}
      {codingTask?.id && (
        <button
          type="button"
          onClick={handleOpenWorkspace}
          className="w-full md:w-auto px-6 py-3 rounded-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          <CodeIcon />
          Open IDE Workspace
        </button>
      )}
    </div>
  );
});

CodingDetail.displayName = "CodingDetail";
