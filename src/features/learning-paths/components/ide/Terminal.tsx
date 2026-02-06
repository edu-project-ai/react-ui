import { useEffect, useRef, memo, forwardRef, useImperativeHandle } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalProps {
  logs: string[];
  onClear?: () => void;
  mode?: "output" | "interactive";
  onData?: (data: string) => void;
  onResize?: (cols: number, rows: number) => void;
}

export interface TerminalHandle {
  write: (data: string) => void;
  clear: () => void;
}

// Minimum dimensions required for xterm.js to calculate cols/rows correctly
const MIN_TERMINAL_WIDTH = 100;
const MIN_TERMINAL_HEIGHT = 50;

/**
 * Safe fit function that handles cases when container has no dimensions
 * (e.g., during initial render or when panel is collapsed)
 */
const safeFit = (fitAddon: FitAddon | null, container: HTMLElement | null, term: XTerm | null): boolean => {
  if (!fitAddon || !container || !term) {
    console.debug('[Terminal] safeFit: missing addon, container, or term');
    return false;
  }

  const { offsetWidth, offsetHeight } = container;

  if (offsetWidth < MIN_TERMINAL_WIDTH || offsetHeight < MIN_TERMINAL_HEIGHT) {
    console.debug(`[Terminal] safeFit: container too small (${offsetWidth}x${offsetHeight})`);
    return false;
  }

  try {
    const terminalElement = container.querySelector('.xterm');
    if (!terminalElement) {
      console.debug('[Terminal] safeFit: xterm element not found in DOM');
      return false;
    }

    // ✅ ВИПРАВЛЕННЯ: Глибша перевірка renderer готовності
    const xtermInternal = (term as unknown as { _core?: { _renderService?: { dimensions?: unknown }; renderService?: { dimensions?: unknown }; viewport?: unknown } })._core;
    if (!(xtermInternal?._renderService ?? xtermInternal?.renderService)?.dimensions) {
      console.debug('[Terminal] safeFit: xterm renderer not ready (dimensions missing)');
      return false;
    }

    // ✅ ВИПРАВЛЕННЯ: Додаткова перевірка viewport
    const viewport = xtermInternal?.viewport;
    if (!viewport) {
      console.debug('[Terminal] safeFit: viewport not ready');
      return false;
    }

    fitAddon.fit();
    console.debug(`[Terminal] safeFit: success (${offsetWidth}x${offsetHeight})`);
    return true;
  } catch (e) {
    console.warn('[Terminal] safeFit: error during fit', e);
    return false;
  }
};

export const Terminal = memo(forwardRef<TerminalHandle, TerminalProps>(({ logs, onClear, mode = "output", onData, onResize }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const lastLogCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Input buffer for interactive mode - accumulate characters locally and send complete lines
  const inputBufferRef = useRef<string>('');
  // Prompt string (colored) - used for local display
  const promptRef = useRef<string>('\x1b[1;34m$\x1b[0m ');

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    write: (data: string) => {
      if (xtermRef.current) {
        try {
          xtermRef.current.write(data);
        } catch (e) {
          console.warn('[Terminal] write failed', e);
        }
      }
    },
    clear: () => {
      if (xtermRef.current) {
        xtermRef.current.clear();
      }
    }
  }));

  // Initialize Terminal
  useEffect(() => {
    if (!terminalRef.current) return;
    
    isMountedRef.current = true;

    const isInteractive = mode === "interactive";

    const term = new XTerm({
      cursorBlink: isInteractive,
      fontSize: 14,
      fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
      theme: {
        background: "#0d0d0d", // Darker background to match IDE
        foreground: "#eff0eb",
        cursor: "#eff0eb",
        selectionBackground: "rgba(255, 255, 255, 0.3)",
      },
      disableStdin: !isInteractive, // Enable input for interactive mode
      convertEol: true, // Treat \n as new line
      rows: 24, // Default rows
      cols: 80, // Default cols
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    try {
      term.open(terminalRef.current);
    } catch (openError) {
      console.warn('[Terminal] term.open() failed, continuing...', openError);
      // safeFit and the ResizeObserver will handle sizing later
    }

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Auto-focus the terminal in interactive mode so user keystrokes are captured
    if (isInteractive) {
      try {
        term.focus();
      } catch (e) {
        console.warn('[Terminal] focus failed', e);
      }
    }

    // Interactive mode: setup input and resize handlers
    if (isInteractive && onData) {
      term.onData((data) => {
        try {
          // If this looks like an escape sequence (arrows, delete sequences), forward immediately
          if (data.charCodeAt(0) === 0x1b) {
            onData(data);
            return;
          }

          // Enter: send the full buffered command (with newline) to backend
          if (data === '\r') {
            const command = inputBufferRef.current;
            term.write('\r\n');

            // Send full command + newline to backend
            try { onData(command + '\n'); } catch (e) { console.warn('[Terminal] send command failed', e); }

            // Clear local buffer; do not locally print prompt - wait for shell prompt from backend
            inputBufferRef.current = '';
            return;
          }

          // Backspace/Delete: only remove from buffer and visually, do not allow deleting prompt
          if (data === '\x7f' || data === '\b' || data === '\x08') {
            if (inputBufferRef.current.length > 0) {
              // Remove last character from buffer and erase visually
              inputBufferRef.current = inputBufferRef.current.slice(0, -1);
              term.write('\b \b');
            }
            // If buffer empty, ignore (protect prompt)
            return;
          }

          // Ctrl+C: show ^C, newline and send SIGINT to backend, reset buffer
          if (data === '\x03') {
            term.write('^C\r\n');
            try { onData('\x03'); } catch (e) { console.warn('[Terminal] send ctrl-c failed', e); }
            inputBufferRef.current = '';
            // We don't print prompt locally; backend/shell will emit a prompt
            return;
          }

          // Regular printable character - buffer locally and echo
          inputBufferRef.current += data;
          term.write(data);
        } catch (e) {
          console.warn('[Terminal] onData processing failed', e);
        }
      });
    }

    if (isInteractive && onResize) {
      term.onResize(({ cols, rows }) => {
        onResize(cols, rows);
      });
    }

    // Use IntersectionObserver for reliable visibility detection
    const attemptInitialFit = () => {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio > 0 && isMountedRef.current) {
          // Terminal is visible, try fitting
          requestAnimationFrame(() => {
            if (!isMountedRef.current) return;
            const success = safeFit(fitAddon, terminalRef.current, term);

            // Retry once if failed
            if (!success) {
              setTimeout(() => {
                if (isMountedRef.current) {
                  safeFit(fitAddon, terminalRef.current, term);
                }
              }, 150);
            }
          });

          observer.disconnect();
        }
      }, {
        threshold: 0.1, // Trigger when 10% visible
      });

      observerRef.current = observer;

      if (terminalRef.current) {
        observer.observe(terminalRef.current);
      }

      // Fallback timeout in case observer doesn't trigger
      setTimeout(() => {
        if (isMountedRef.current) {
          safeFit(fitAddon, terminalRef.current, term);
        }
        observer.disconnect();
      }, 300);
    };

    attemptInitialFit();

    // Resize observer to handle window/container resizing
    const container = terminalRef.current;

    // Debounce helper to avoid excessive fit() calls during rapid resize
    let resizeTimeout: number | null = null;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce: wait 50ms without changes before calling fit()
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = window.setTimeout(() => {
        if (isMountedRef.current) {
          requestAnimationFrame(() => {
            if (isMountedRef.current) {
              safeFit(fitAddon, container, term);
            }
          });
        }
        resizeTimeout = null;
      }, 50);
    });

    resizeObserver.observe(terminalRef.current);

    // Initial greeting (only in output mode)
    if (!isInteractive) {
      try {
        term.writeln("\x1b[1;32m$ Ready to execute...\x1b[0m");
      } catch (e) {
        console.warn('[Terminal] initial writeln failed', e);
      }
    } else {
      try {
        term.writeln("\x1b[1;32mWelcome to Roadly Terminal\x1b[0m");
        term.writeln("Type commands to interact with your Docker container.");
        term.write(promptRef.current);
      } catch (e) {
        console.warn('[Terminal] initial writeln failed', e);
      }
    }

    return () => {
      isMountedRef.current = false;
      term.dispose();
      resizeObserver.disconnect();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [mode, onData, onResize]);

  // Handle Log Updates with incremental approach (only in output mode)
  useEffect(() => {
    if (mode === "interactive" || !xtermRef.current) return;

    const term = xtermRef.current;
    const newLogCount = logs.length;
    const lastCount = lastLogCountRef.current;

    try {
      // Case 1: Logs cleared (reset)
      if (newLogCount === 0) {
        term.clear();
        term.writeln("\x1b[1;32m$ Ready to execute...\x1b[0m");
        lastLogCountRef.current = 0;
        return;
      }

      // Case 2: Logs replaced (length decreased)
      if (newLogCount < lastCount) {
        term.clear();
        logs.forEach((log) => {
          try {
            const safeLog = typeof log === 'string' ? log : JSON.stringify(log);
            term.writeln(safeLog);
          } catch (e) {
            console.warn('[Terminal] failed to write log', e);
          }
        });
        term.scrollToBottom();
        lastLogCountRef.current = newLogCount;
        return;
      }

      // Case 3: New logs appended (incremental update)
      const newLogs = logs.slice(lastCount);
      newLogs.forEach((log) => {
        try {
          const safeLog = typeof log === 'string' ? log : JSON.stringify(log);
          term.writeln(safeLog);
        } catch (e) {
          console.warn('[Terminal] failed to write log', e);
        }
      });

      // Auto-scroll only if already near bottom
      const isNearBottom = term.buffer.active.baseY + term.rows >= term.buffer.active.length - 3;
      if (isNearBottom) {
        term.scrollToBottom();
      }

      lastLogCountRef.current = newLogCount;
    } catch (e) {
      console.warn('[Terminal] error applying logs', e);
    }
  }, [logs, mode]);

  return (
    <div className="h-full w-full bg-[#0d0d0d] flex flex-col overflow-hidden">
        {/* Terminal Header - use shrink-0 to prevent flex shrinking */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-[#0d0d0d] border-b border-[#1a1a1a]">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Terminal</span>
             {onClear && (
              <button
                onClick={onClear}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
            )}
        </div>
        {/* Terminal Body - allow ResizeObserver to work, ensure min-h-0 for flex */}
        <div
          ref={terminalRef}
          className="flex-1 min-h-0 cursor-text"
          onClick={() => {
            // Bring focus to xterm when user clicks the terminal area
            try { xtermRef.current?.focus(); } catch (e) { console.warn('[Terminal] focus on click failed', e); }
          }}
        />
    </div>
  );
}));

Terminal.displayName = "Terminal";
