import { memo } from "react";
import Markdown from 'react-markdown'
import { useParams } from "react-router-dom";
import { useGetTheoryResourceQuery } from "../../api/learningPathsApi";
import type { TheoryItem } from "../../services/type";

const BookIcon = memo(() => (
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
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
));
BookIcon.displayName = "BookIcon";
export interface TheoryDetailProps {
  item: TheoryItem;
}

export const TheoryDetail = memo(({ item }: TheoryDetailProps) => {
  const { id: learningPathId } = useParams<{ id: string }>();
  const {
    data: theoryResource,
    isLoading,
    error,
  } = useGetTheoryResourceQuery(
    { learningPathId: learningPathId!, itemId: item.id },
    { skip: !learningPathId }
  );

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <BookIcon />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Theory
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">{item.title}</h2>

        {item.summary && (
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
              {item.summary}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="bg-muted/30 rounded-lg p-8 text-center border border-dashed border-border animate-pulse">
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
            <p className="text-destructive text-sm">
              Failed to load theory content. Please try again.
            </p>
          </div>
        )}
        {(theoryResource?.content) && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <Markdown>
                {theoryResource?.content ?? "*No content available*"}
              </Markdown>
            </div>
          </div>
        )}

        {!isLoading && !error && !theoryResource?.content && (
          <div className="bg-muted/30 rounded-lg p-8 text-center border border-dashed border-border">
            <p className="text-muted-foreground">
              No content available for this theory item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

TheoryDetail.displayName = "TheoryDetail";
