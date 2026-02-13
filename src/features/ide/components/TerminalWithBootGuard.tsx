import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useConsole } from '../hooks/useConsole';

interface TerminalWithBootGuardProps {
  language: string;
  token: string;
  taskId?: string;
}

/**
 * Terminal component with boot guard overlay.
 * Shows loading state while booting, then displays the interactive terminal.
 */
export const TerminalWithBootGuard: React.FC<TerminalWithBootGuardProps> = ({
  language,
  token,
  taskId,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isTerminalReady, setIsTerminalReady] = useState(false);
  const isInitializingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Handle data received from the backend - use useCallback for stability
  const handleData = useCallback((data: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(data);
    }
  }, []);

  // Handle errors from the backend - use useCallback for stability
  const handleError = useCallback((error: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(`\r\n\x1b[31mError: ${error}\x1b[0m\r\n`);
    }
  }, []);

  // Use the console hook for connection management
  const { status, isConnected, writeCommand, resize, error } = useConsole({
    language,
    token,
    taskId,
    onData: handleData,
    onError: handleError,
  });

  // Initialize xterm.js (only when connection is established)
  useEffect(() => {
    if (status === 'idle' || status === 'error') {
      return;
    }

    // Prevent double initialization
    if (!terminalRef.current || xtermRef.current || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
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
      rows: 30,
      cols: 100,
      scrollback: 1000,
      convertEol: false,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    
    if (isMountedRef.current) {
      setIsTerminalReady(true);
    }

    return () => {
      isMountedRef.current = false;
      isInitializingRef.current = false;
      
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
      fitAddonRef.current = null;
      setIsTerminalReady(false);
    };
  }, [status]);

  // Auto-focus terminal when ready and connected
  useEffect(() => {
    if (!xtermRef.current || !isTerminalReady || !isConnected) {
      return;
    }

    const timeoutId = setTimeout(() => {
      xtermRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isTerminalReady, isConnected]);

  // Handle user input (key presses) — Raw PTY mode: NO local echo
  useEffect(() => {
    if (!xtermRef.current || !isTerminalReady || !isConnected) {
      return;
    }

    const term = xtermRef.current;

    // Send raw keystrokes to backend; PTY handles echo
    const disposable = term.onData((data) => {
      writeCommand(data);
    });

    return () => {
      disposable.dispose();
    };
  }, [isTerminalReady, isConnected, writeCommand]);

  // Handle terminal resize
  useEffect(() => {
    if (!xtermRef.current || !fitAddonRef.current || !isTerminalReady) {
      return;
    }

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit();
          const { rows, cols } = xtermRef.current;
          resize(rows, cols);
        }
      }, 200);
    };

    // Initial fit
    fitAddonRef.current.fit();
    const { rows, cols } = xtermRef.current;
    resize(rows, cols);

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [isTerminalReady, resize]);

  return (
    <div className="relative w-full h-full">
      {/* Terminal container (always rendered but may be hidden) */}
      <div
        ref={terminalRef}
        className="terminal w-full h-full"
        style={{
          backgroundColor: '#1e1e1e',
          visibility: status === 'connected' ? 'visible' : 'hidden',
        }}
      />

      {/* Booting Guard Overlay - Shown when idle or booting */}
      {(status === 'idle' || status === 'booting') && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
          <div className="text-center space-y-4">
            {/* Spinner */}
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            {/* Text */}
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">
                Booting Remote Environment...
              </p>
              <p className="text-sm text-gray-400">
                Starting Docker container and initializing session
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Screen */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
          <div className="text-center space-y-4 max-w-md px-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            {/* Error Message */}
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">Connection Failed</p>
              <p className="text-sm text-gray-400">
                {error || 'Failed to connect to the remote environment'}
              </p>
            </div>
            {/* Retry Button */}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
