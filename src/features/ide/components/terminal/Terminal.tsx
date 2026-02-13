import React from 'react';
import {
  useDockerTerminal,
  type TerminalStatus,
} from '../../hooks/useDockerTerminal';
import './Terminal.css';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface TerminalProps {
  /** Task ID passed to the .NET container-provisioning endpoint */
  taskId: string;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Fires once the terminal is fully initialized and attached */
  onReady?: () => void;
}

// ─────────────────────────────────────────────
// Sub-components (co-located, presentation-only)
// ─────────────────────────────────────────────

/** Spinner shown while the container boots & WebSocket connects */
const BootOverlay: React.FC = () => (
  <div className="docker-terminal__overlay">
    <div className="docker-terminal__overlay-content">
      <div className="docker-terminal__spinner" />
      <p className="docker-terminal__overlay-title">
        Booting Remote Environment…
      </p>
      <p className="docker-terminal__overlay-subtitle">
        Starting Docker container and connecting PTY
      </p>
    </div>
  </div>
);

/** Error screen with a retry button */
const ErrorOverlay: React.FC<{
  message: string | null;
  onRetry: () => void;
}> = ({ message, onRetry }) => (
  <div className="docker-terminal__overlay">
    <div className="docker-terminal__overlay-content">
      {/* Error circle icon */}
      <div className="docker-terminal__error-icon">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <p className="docker-terminal__error-title">Connection Failed</p>
      <p className="docker-terminal__error-message">
        {message ?? 'Failed to connect to the remote environment'}
      </p>

      <button
        type="button"
        className="docker-terminal__retry-btn"
        onClick={onRetry}
      >
        Retry Connection
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Terminal Component
// ─────────────────────────────────────────────

/**
 * Production-ready terminal that connects to a Go WebSocket proxy
 * (`docker-pty-proxy`) for bidirectional PTY streaming.
 *
 * Usage:
 * ```tsx
 * <Terminal taskId={task.id} />
 * ```
 */
export const Terminal: React.FC<TerminalProps> = ({
  taskId,
  className,
  style,
  onReady,
}) => {
  const { terminalRef, status, error, retry } = useDockerTerminal({
    taskId,
    onReady,
  });

  const isVisible: boolean = status === 'connected';

  return (
    <div
      className={`docker-terminal ${className ?? ''}`}
      style={style}
    >
      {/* xterm.js render target — always in the DOM so ref stays stable */}
      <div
        ref={terminalRef}
        className={`docker-terminal__canvas ${
          isVisible ? '' : 'docker-terminal__canvas--hidden'
        }`}
      />

      {/* Overlays */}
      {(status === 'idle' || status === 'booting') && <BootOverlay />}
      {status === 'error' && (
        <ErrorOverlay message={error} onRetry={retry} />
      )}
    </div>
  );
};

export default Terminal;
