import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useConsole } from '../hooks/useConsole';
import { HubConnectionState } from '@microsoft/signalr';

interface TerminalProps {
  language: string;
  token: string;
  onError?: (error: string) => void;
  autoFocus?: boolean;
}

/**
 * Terminal component that provides an interactive shell interface.
 * Uses xterm.js for the terminal UI and SignalR for backend communication.
 */
export const Terminal: React.FC<TerminalProps> = ({
  language,
  token,
  onError,
  autoFocus = true,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isTerminalReady, setIsTerminalReady] = useState(false);

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
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Use the console hook for connection management
  const { isConnected, connectionState, writeCommand, resize } = useConsole({
    language,
    token,
    onData: handleData,
    onError: handleError,
  });

  // Initialize xterm.js
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) {
      return;
    }

    console.log('Terminal: Initializing xterm.js');

    // Create terminal instance
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
    setIsTerminalReady(true);

    console.log('Terminal: xterm.js initialized');

    return () => {
      console.log('Terminal: Disposing xterm.js');
      term.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
      setIsTerminalReady(false);
    };
  }, []);

  // Auto-focus terminal when ready and connected
  useEffect(() => {
    if (!xtermRef.current || !isTerminalReady || !isConnected || !autoFocus) {
      return;
    }

    // Small delay to ensure everything is properly rendered
    const timeoutId = setTimeout(() => {
      if (xtermRef.current) {
        xtermRef.current.focus();
        console.log('Terminal: Auto-focused');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isTerminalReady, isConnected, autoFocus]);

  // Handle user input (key presses)
  useEffect(() => {
    if (!xtermRef.current || !isTerminalReady || !isConnected) {
      return;
    }

    const term = xtermRef.current;

    // Listen to user input and send to backend
    const disposable = term.onData((data) => {
      // Send the raw data to the backend
      writeCommand(data);
    });

    console.log('Terminal: Input handler attached');

    return () => {
      disposable.dispose();
    };
  }, [isTerminalReady, isConnected, writeCommand]);

  // Handle terminal resize
  useEffect(() => {
    if (!xtermRef.current || !fitAddonRef.current || !isTerminalReady) {
      return;
    }

    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
        const { rows, cols } = xtermRef.current;
        resize(rows, cols);
      }
    };

    // Fit on mount
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isTerminalReady, resize]);

  // Display connection status
  useEffect(() => {
    if (!xtermRef.current) return;

    if (connectionState === HubConnectionState.Connecting) {
      xtermRef.current.write('\r\n\x1b[33mConnecting...\x1b[0m\r\n');
    } else if (connectionState === HubConnectionState.Connected && isTerminalReady) {
      xtermRef.current.write('\r\n\x1b[32mConnected to terminal\x1b[0m\r\n');
    } else if (connectionState === HubConnectionState.Reconnecting) {
      xtermRef.current.write('\r\n\x1b[33mReconnecting...\x1b[0m\r\n');
    } else if (connectionState === HubConnectionState.Disconnected) {
      xtermRef.current.write('\r\n\x1b[31mDisconnected\x1b[0m\r\n');
    }
  }, [connectionState, isTerminalReady]);

  return (
    <div className="terminal-container" style={{ width: '100%', height: '100%' }}>
      {/* Connection status indicator */}
      <div
        className="terminal-status"
        style={{
          padding: '8px 12px',
          backgroundColor: isConnected ? '#0dbc79' : '#cd3131',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {connectionState === HubConnectionState.Connected && '● Connected'}
        {connectionState === HubConnectionState.Connecting && '○ Connecting...'}
        {connectionState === HubConnectionState.Reconnecting && '◐ Reconnecting...'}
        {connectionState === HubConnectionState.Disconnected && '○ Disconnected'}
      </div>

      {/* Terminal container */}
      <div
        ref={terminalRef}
        className="terminal"
        style={{
          width: '100%',
          height: 'calc(100% - 32px)',
          backgroundColor: '#1e1e1e',
        }}
      />
    </div>
  );
};
