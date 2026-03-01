import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from '@xterm/addon-attach';
import 'xterm/css/xterm.css';
import { useStartTaskSessionMutation } from '../api/codeExecutionApi';

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
  onSessionCreated?: (containerId: string) => void;
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
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const WS_PROXY_BASE_URL =
  import.meta.env.VITE_WS_PROXY_URL ?? 'ws://localhost:8080';

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
// Hook
// ─────────────────────────────────────────────

/**
 * Encapsulates the full lifecycle of a Docker-attached terminal:
 *
 * 1. Calls the .NET backend to provision a container → gets `containerId`.
 * 2. Opens a binary WebSocket to the Go `docker-pty-proxy`.
 * 3. Creates an xterm.js instance with FitAddon + AttachAddon.
 * 4. Forwards resize events as JSON messages over the same socket.
 * 5. Cleans up everything on unmount (Strict-Mode safe via cancelled flag).
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

    const boot = async () => {
      if (!terminalRef.current) return;

      setStatus('booting');
      setError(null);

      try {
        // 1) Provision the container via the .NET REST API
        const { sessionId: containerId } = await startTaskSession({
          taskId,
        }).unwrap();

        if (cancelled) return;

        // Notify parent about the provisioned container
        onSessionCreatedRef.current?.(containerId);

        // 2) Open the binary WebSocket to the Go proxy
        const wsUrl = `${WS_PROXY_BASE_URL}/attach?id=${containerId}`;
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

        // 3) Initialize xterm.js
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

        // 4) Resize forwarding — send JSON over the same socket
        term.onResize(({ cols, rows }) => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({ type: 'resize', cols, rows }),
            );
          }
        });

        // Send initial resize so the proxy knows the real terminal size
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'resize',
              cols: term.cols,
              rows: term.rows,
            }),
          );
        }

        // 5) Observe container resizes (panel drag, window resize, etc.)
        const observer = new ResizeObserver(() => {
          if (fitAddonRef.current && xtermRef.current) {
            fitAddonRef.current.fit();
          }
        });
        observer.observe(terminalRef.current);
        resizeObserverRef.current = observer;

        // 6) Handle unexpected socket closure
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
      } catch (err) {
        if (cancelled) return;
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

  return { terminalRef, status, error, retry };
};
