import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from '@xterm/addon-attach';
import 'xterm/css/xterm.css';
import {
  useStartTaskSessionMutation,
  useLazyGetSessionStatusQuery,
} from '../api/codeExecutionApi';
import { getAccessToken } from '../../../lib/token-provider';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type { TerminalStatus } from '../types';
import type { TerminalStatus } from '../types';

interface UseDockerTerminalOptions {
  /** The task ID to create a container session for */
  taskId: string;
  /** Called when the terminal is fully initialized and attached */
  onReady?: () => void;
  /** Called once the container has been provisioned, with the containerId */
  onSessionCreated?: (containerId: string, mappedPorts?: Record<string, number>) => void;
}

interface UseDockerTerminalReturn {
  /** Ref to attach to the container <div> where xterm renders */
  terminalRef: React.RefObject<HTMLDivElement | null>;
  /** Current connection lifecycle status */
  status: TerminalStatus;
  /** Error message if status === 'error' */
  error: string | null;
  /** Retry the entire boot sequence from scratch */
  retry: () => void;
  /** Active WebSocket connection (for sending commands) */
  socketRef: React.RefObject<WebSocket | null>;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const WS_PROXY_BASE_URL =
  import.meta.env.VITE_WS_PROXY_URL ?? 'ws://localhost:8080';

const SESSION_STORAGE_KEY = 'roadly:ide-session';

const XTERM_OPTIONS: ConstructorParameters<typeof Terminal>[0] = {
  cursorBlink: true,
  cursorStyle: 'block',
  fontSize: 14,
  fontFamily: "'Fira Code', Menlo, Monaco, 'Courier New', monospace",
  theme: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#ffffff',
    selectionBackground: '#264f78',
    selectionForeground: '#ffffff',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#e5e5e5',
  },
  scrollback: 5000,
  convertEol: false,
};

// ─────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────

interface PersistedSession {
  taskId: string;
  containerId: string;
  mappedPorts?: Record<string, number>;
}

function saveSession(session: PersistedSession) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage might be full or disabled — not critical
  }
}

function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // not critical
  }
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

/**
 * Encapsulates the full lifecycle of a Docker-attached terminal:
 *
 * 1. Checks for an existing session (localStorage + backend verification).
 * 2. If no valid session exists, provisions a new container via .NET REST API.
 * 3. Opens a binary WebSocket to the Go `docker-pty-proxy`.
 * 4. Creates an xterm.js instance with FitAddon + AttachAddon.
 * 5. Forwards resize events as JSON messages over the same socket.
 * 6. Cleans up everything on unmount (Strict-Mode safe via cancelled flag).
 */
export const useDockerTerminal = ({
  taskId,
  onReady,
  onSessionCreated,
}: UseDockerTerminalOptions): UseDockerTerminalReturn => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<TerminalStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);

  // Resource refs for cleanup
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const attachAddonRef = useRef<AttachAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const onReadyRef = useRef(onReady);
  const onSessionCreatedRef = useRef(onSessionCreated);

  const [startTaskSession] = useStartTaskSessionMutation();
  const [getSessionStatus] = useLazyGetSessionStatusQuery();

  // Keep callback refs fresh without re-triggering the boot effect
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onSessionCreatedRef.current = onSessionCreated;
  }, [onSessionCreated]);

  // ── Boot + cleanup effect (Strict-Mode safe) ──
  useEffect(() => {
    let cancelled = false;

    const disposeResources = () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;

      attachAddonRef.current?.dispose();
      attachAddonRef.current = null;

      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        if (
          socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING
        ) {
          socketRef.current.close();
        }
        socketRef.current = null;
      }

      fitAddonRef.current = null;

      xtermRef.current?.dispose();
      xtermRef.current = null;
    };

    /**
     * Attempt to reconnect to a previously persisted session.
     * Returns { containerId, mappedPorts } if the session is still alive,
     * or null if we need to create a fresh one.
     */
    const tryReconnect = async (): Promise<PersistedSession | null> => {
      const persisted = loadSession();

      // No persisted session or different task → create new
      if (!persisted || persisted.taskId !== taskId) return null;

      try {
        const { data } = await getSessionStatus();
        if (data?.hasActiveSession && data.isRunning && data.containerId) {
          return {
            taskId,
            containerId: data.containerId,
            mappedPorts: persisted.mappedPorts,
          };
        }
      } catch {
        // Backend unreachable or session gone → fall through
      }

      // Stale persisted data
      clearSession();
      return null;
    };

    /** Connect WebSocket + xterm to an existing containerId */
    const connectTerminal = async (containerId: string) => {
      if (!terminalRef.current || cancelled) return;

      const proxyToken = await getAccessToken();
      const wsUrl = `${WS_PROXY_BASE_URL}/attach?id=${containerId}${proxyToken ? `&token=${encodeURIComponent(proxyToken)}` : ''}`;
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      socketRef.current = ws;

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = () =>
          reject(new Error(`WebSocket failed to connect: ${wsUrl}`));

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timed out'));
        }, 10_000);

        ws.addEventListener('open', () => clearTimeout(timeout), {
          once: true,
        });
        ws.addEventListener('error', () => clearTimeout(timeout), {
          once: true,
        });
      });

      if (cancelled) {
        ws.close();
        socketRef.current = null;
        return;
      }

      if (!terminalRef.current) {
        ws.close();
        socketRef.current = null;
        return;
      }

      const term = new Terminal(XTERM_OPTIONS);
      xtermRef.current = term;

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);

      const attachAddon = new AttachAddon(ws);
      attachAddonRef.current = attachAddon;
      term.loadAddon(attachAddon);

      term.open(terminalRef.current);
      fitAddon.fit();

      // Resize forwarding
      term.onResize(({ cols, rows }) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({ type: 'resize', cols, rows }),
          );
        }
      });

      // Send initial resize
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'resize',
            cols: term.cols,
            rows: term.rows,
          }),
        );
      }

      // Observe container resizes
      const observer = new ResizeObserver(() => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit();
        }
      });
      observer.observe(terminalRef.current);
      resizeObserverRef.current = observer;

      // Handle unexpected socket closure
      ws.onclose = (event) => {
        if (xtermRef.current) {
          xtermRef.current.write(
            `\r\n\x1b[31m⚠ Connection lost (code ${event.code})\x1b[0m\r\n`,
          );
        }
        setStatus('error');
        setError(`Connection closed (code ${event.code})`);
      };

      ws.onerror = () => {
        if (xtermRef.current) {
          xtermRef.current.write(
            '\r\n\x1b[31m⚠ Connection error\x1b[0m\r\n',
          );
        }
      };

      setStatus('connected');
      term.focus();
      onReadyRef.current?.();
    };

    const boot = async () => {
      if (!terminalRef.current) return;

      setStatus('booting');
      setError(null);

      try {
        // 1) Attempt reconnection to existing session
        const existing = await tryReconnect();

        if (cancelled) return;

        let containerId: string;
        let mappedPorts: Record<string, number> | undefined;

        if (existing) {
          // Reconnecting to existing container
          containerId = existing.containerId;
          mappedPorts = existing.mappedPorts;
        } else {
          // 2) Provision a new container
          const result = await startTaskSession({ taskId }).unwrap();
          if (cancelled) return;
          containerId = result.sessionId;
          mappedPorts = result.mappedPorts;

          // Persist for future reconnection
          saveSession({ taskId, containerId, mappedPorts });
        }

        // Notify parent about the container
        onSessionCreatedRef.current?.(containerId, mappedPorts);

        // 3) Connect WebSocket + xterm
        await connectTerminal(containerId);
      } catch (err) {
        if (cancelled) return;

        // If reconnect failed (e.g. container died), clear and retry with fresh session
        const persisted = loadSession();
        if (persisted && persisted.taskId === taskId) {
          clearSession();
          disposeResources();
          // Try once more with a fresh session
          try {
            const result = await startTaskSession({ taskId }).unwrap();
            if (cancelled) return;

            saveSession({
              taskId,
              containerId: result.sessionId,
              mappedPorts: result.mappedPorts,
            });
            onSessionCreatedRef.current?.(result.sessionId, result.mappedPorts);
            await connectTerminal(result.sessionId);
            return;
          } catch (retryErr) {
            if (cancelled) return;
            const message =
              retryErr instanceof Error
                ? retryErr.message
                : 'Failed to start terminal session';
            setError(message);
            setStatus('error');
            disposeResources();
            return;
          }
        }

        const message =
          err instanceof Error
            ? err.message
            : 'Failed to start terminal session';
        setError(message);
        setStatus('error');
        disposeResources();
      }
    };

    boot();

    return () => {
      cancelled = true;
      disposeResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, retryCounter]);

  // ── Retry — full teardown + re-boot ─────────
  const retry = () => {
    setStatus('idle');
    setError(null);
    setRetryCounter((c) => c + 1);
  };

  return { terminalRef, status, error, retry, socketRef };
};
