import { memo, useEffect, useRef, useCallback, useMemo, useState } from "react";
import AnsiToHtml from "ansi-to-html";
import DOMPurify from "dompurify";
import type { SessionState } from "../../hooks/useCodeSession";

// ============================================================================
// Types
// ============================================================================

interface TerminalPanelProps {
  logs: string[];
  sessionState: SessionState;
  error: string | null;
  onClear: () => void;
}

// ============================================================================
// Icons
// ============================================================================

const TerminalIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
));
TerminalIcon.displayName = "TerminalIcon";

const ClearIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
));
ClearIcon.displayName = "ClearIcon";

const MaximizeIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
    />
  </svg>
));
MaximizeIcon.displayName = "MaximizeIcon";

// ============================================================================
// Main Component
// ============================================================================

export const TerminalPanel = memo(({
  logs,
  sessionState,
  error,
  onClear,
}: TerminalPanelProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Convert ANSI codes to HTML
  const renderLogs = useMemo(() => {
    const converter = new AnsiToHtml({
      fg: "#d4d4d4",
      bg: "transparent",
      newline: true,
      escapeXML: true,
    });
    
    return logs.map((log, index) => {
      const htmlContent = converter.toHtml(log);
      const sanitizedHtml = DOMPurify.sanitize(htmlContent);
      return (
        <div
          key={index}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    });
  }, [logs]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <div
      className={`
        flex flex-col bg-[#0d0d0d] border-t border-[#1a1a1a]
        ${isExpanded ? "h-96" : "h-48"}
        transition-all duration-200
      `}
    >
      {/* Terminal Header */}
      <div className="h-9 flex items-center justify-between px-3 bg-[#151515] border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <TerminalIcon />
          <span className="text-xs font-medium text-zinc-300">TERMINAL</span>
          <span className="text-xs text-zinc-500">
            ({logs.length} {logs.length === 1 ? "line" : "lines"})
          </span>
          {sessionState === "Running" && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Running
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
              title="Clear terminal"
            >
              <ClearIcon />
            </button>
          )}
          <button
            onClick={handleToggleExpand}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            <MaximizeIcon />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm text-zinc-300"
      >
        {error && (
          <div className="mb-2 p-2 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}
        
        {logs.length === 0 ? (
          <div className="text-zinc-500 flex items-center gap-2">
            <span className="text-green-400">$</span>
            <span className="animate-pulse">_</span>
          </div>
        ) : (
          <div className="space-y-0.5">
            {renderLogs}
          </div>
        )}
      </div>
    </div>
  );
});



TerminalPanel.displayName = "TerminalPanel";
