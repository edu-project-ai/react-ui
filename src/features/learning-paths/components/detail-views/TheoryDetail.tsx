import { memo, useState, useCallback, useEffect, useRef } from "react";
import Markdown from 'react-markdown'
import { useParams, Link } from "react-router-dom";
import { useGetTheoryResourceQuery, useGetItemResourcesQuery, useRequestTheoryHelpMutation } from "../../api/learningPathsApi";
import type { TheoryItem } from "../../services/type";
import { AgentHelpModal } from "../AgentHelpModal";

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

  const { data: resources } = useGetItemResourcesQuery(
    { learningPathId: learningPathId!, itemId: item.id },
    { skip: !learningPathId }
  );

  const [requestTheoryHelp, { isLoading: isHelpLoading }] = useRequestTheoryHelpMutation();

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpOutput, setHelpOutput] = useState<string | null>(null);
  const [helpError, setHelpError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when question modal opens
  useEffect(() => {
    if (questionModalOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [questionModalOpen]);

  const handleAskQuestion = useCallback(async () => {
    if (!learningPathId || !userQuestion.trim()) return;
    setQuestionModalOpen(false);
    setHelpOutput(null);
    setHelpError(false);
    setHelpModalOpen(true);
    try {
      const response = await requestTheoryHelp({
        learningPathId,
        itemId: item.id,
        data: { userQuestion: userQuestion.trim() },
      }).unwrap();
      setHelpOutput(response.agentOutput);
    } catch {
      setHelpError(true);
    }
  }, [learningPathId, item.id, userQuestion, requestTheoryHelp]);

  const handleOpenQuestion = useCallback(() => {
    setUserQuestion("");
    setQuestionModalOpen(true);
  }, []);

  const hasResources = resources && resources.length > 0;

  return (
    <>
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

          {theoryResource?.content && (
            <div className="p-6 overflow-y-auto h-full">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <Markdown>
                  {theoryResource.content}
                </Markdown>
              </div>
            </div>
          )}

          {/* Structured resources from API */}
          {hasResources && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Resources
              </h3>
              <ul className="space-y-2">
                {resources.map((resource) => (
                  <li key={resource.id} className="flex items-center justify-between gap-2">
                    <Link
                      to={`/learning-paths/${learningPathId}/resources/${resource.id}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1.5 min-w-0"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="truncate">{resource.title}</span>
                    </Link>
                    {resource.type && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                        {resource.type}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isLoading && !error && !theoryResource?.content && (
            <div className="bg-muted/30 rounded-lg p-8 text-center border border-dashed border-border">
              <p className="text-muted-foreground">
                No content available for this theory item.
              </p>
            </div>
          )}

          {/* AI Help button — shown when content is loaded */}
          {!isLoading && !error && (
            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={handleOpenQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-violet-400 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                I don't understand
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Question input modal */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setQuestionModalOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">What don't you understand?</h2>
              <button
                type="button"
                onClick={() => setQuestionModalOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <textarea
                ref={textareaRef}
                rows={4}
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value.slice(0, 2000))}
                placeholder="Describe what part of the theory is unclear..."
                className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-violet-500 focus:outline-none bg-background text-foreground text-sm resize-none transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{userQuestion.length}/2000</p>
            </div>
            <div className="p-4 border-t border-border flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setQuestionModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAskQuestion}
                disabled={!userQuestion.trim() || isHelpLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
              >
                Ask AI Tutor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI help result modal */}
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

TheoryDetail.displayName = "TheoryDetail";
