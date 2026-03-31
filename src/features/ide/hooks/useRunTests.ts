import React, { useCallback, useRef } from 'react';

const TEST_COMMANDS: Record<string, string> = {
  javascript: 'npm test',
  typescript: 'npm test',
  python: 'python -m pytest -v',
  java: 'mvn test',
  csharp: 'dotnet test',
  go: 'go test ./...',
  rust: 'cargo test',
  ruby: 'bundle exec rspec',
  php: 'php vendor/bin/phpunit',
};

/**
 * Hook to run tests by writing a command into the terminal WebSocket.
 * Accepts a ref to the active WebSocket from useDockerTerminal.
 */
export function useRunTests() {
  // Store the ref object (not the value) so runTests always reads the latest .current
  const socketRefRef = useRef<React.RefObject<WebSocket | null> | null>(null);

  const setSocket = useCallback((ref: React.RefObject<WebSocket | null>) => {
    socketRefRef.current = ref;
  }, []);

  const runTests = useCallback((language?: string) => {
    const ws = socketRefRef.current?.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const cmd = TEST_COMMANDS[language?.toLowerCase() ?? ''] ?? 'npm test';
    // Send the command as raw bytes (the terminal is a PTY)
    const encoder = new TextEncoder();
    ws.send(encoder.encode(cmd + '\n'));
  }, []);

  return { setSocket, runTests };
}
