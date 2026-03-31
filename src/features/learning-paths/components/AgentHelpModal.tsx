import { memo, useEffect } from "react";
import Markdown from "react-markdown";

// ============================================================================
// Icons
// ============================================================================

const SpinnerIcon = memo(() => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
));
SpinnerIcon.displayName = "SpinnerIcon";

const BrainIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
));
BrainIcon.displayName = "BrainIcon";

const XIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
));
XIcon.displayName = "XIcon";

// ============================================================================
// Types
// ============================================================================

export interface AgentHelpModalProps {
  isOpen: boolean;
  isLoading: boolean;
  agentOutput: string | null;
  error: boolean;
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const AgentHelpModal = memo(({ isOpen, isLoading, agentOutput, error, onClose }: AgentHelpModalProps) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="AI Help"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] bg-card rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-border flex-shrink-0">
          <div className="p-2 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            <BrainIcon />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">AI Tutor</h2>
            <p className="text-xs text-muted-foreground">Personalized explanation</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
              <SpinnerIcon />
              <p className="text-sm">The AI tutor is thinking...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
              <p className="text-sm text-destructive">
                Failed to get AI help. Please try again.
              </p>
            </div>
          )}

          {agentOutput && !isLoading && (
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
              <Markdown>{agentOutput}</Markdown>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="flex-shrink-0 p-4 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

AgentHelpModal.displayName = "AgentHelpModal";
