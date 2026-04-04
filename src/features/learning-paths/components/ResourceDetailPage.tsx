import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetResourceByIdQuery } from "../api/learningPathsApi";
import { getAuthToken } from "@/lib/token-provider";

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL as string;

type IngestStatus = "idle" | "loading" | "success" | "error";

const TYPE_LABELS: Record<string, string> = {
  article: "Article",
  video: "Video",
  documentation: "Documentation",
  book: "Book",
  tutorial: "Tutorial",
  course: "Course",
  tool: "Tool",
};

export const ResourceDetailPage = () => {
  const { resourceId } = useParams<{
    resourceId: string;
  }>();
  const navigate = useNavigate();

  const { data: resource, isLoading, error } = useGetResourceByIdQuery(
    resourceId!,
    { skip: !resourceId }
  );

  const [ingestStatus, setIngestStatus] = useState<IngestStatus>("idle");

  const handleIngest = useCallback(async () => {
    if (!resource?.url) return;
    setIngestStatus("loading");
    try {
      const token = await getAuthToken();
      const res = await fetch(`${PYTHON_API_URL}/api/rag/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: resource.url }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setIngestStatus("success");
    } catch {
      setIngestStatus("error");
    }
  }, [resource?.url]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <p className="text-destructive font-medium">Resource not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const typeLabel = TYPE_LABELS[resource.type?.toLowerCase()] ?? resource.type;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {typeLabel && (
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {typeLabel}
                  </span>
                )}
                {resource.language && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {resource.language}
                  </span>
                )}
                {resource.difficultyLevel && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {resource.difficultyLevel}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground break-words">
                {resource.title}
              </h1>
            </div>
          </div>

          {/* URL */}
          {resource.url ? (
            <div className="flex items-center flex-wrap gap-3 mb-6">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open resource
              </a>
              <button
                type="button"
                onClick={handleIngest}
                disabled={ingestStatus === "loading" || ingestStatus === "success"}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {ingestStatus === "loading" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Scraping...
                  </>
                ) : ingestStatus === "success" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to RAG
                  </>
                ) : ingestStatus === "error" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Retry
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Add to RAG
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 mb-6 bg-muted text-muted-foreground rounded-lg text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              No link available
            </div>
          )}

          {/* Content */}
          {resource.content && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                Description
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {resource.content}
              </p>
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            {resource.estimatedReadTime != null && (
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Read time</p>
                <p className="text-sm font-medium text-foreground">
                  {resource.estimatedReadTime} min
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
