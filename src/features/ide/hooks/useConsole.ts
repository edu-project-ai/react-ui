import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnectionState } from '@microsoft/signalr';
import { consoleHubService } from '../services/consoleHub.service';
import type { SessionInfo } from '../store/types';
import { useStartSessionMutation, useStartTaskSessionMutation } from '../api/codeExecutionApi';

export type ConnectionStatus = 'idle' | 'booting' | 'connected' | 'error';

interface UseConsoleProps {
  language: string;
  token: string;
  taskId?: string;
  onData: (data: string) => void;
  onError?: (error: string) => void;
}

interface UseConsoleReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  connectionState: HubConnectionState;
  sessionId: string | null;
  writeCommand: (command: string) => Promise<void>;
  resize: (rows: number, cols: number) => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

/**
 * Custom hook to manage the console connection and lifecycle.
 * Handles session initialization, connection, reconnection, and cleanup automatically.
 */
export const useConsole = ({
  language,
  token,
  taskId,
  onData,
  onError,
}: UseConsoleProps): UseConsoleReturn => {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected
  );
  const isConnectingRef = useRef(false);
  const sessionRef = useRef<SessionInfo | null>(null);
  const hasInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Use refs for callbacks to avoid dependency chain issues
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onDataRef.current = onData;
    onErrorRef.current = onError;
  }, [onData, onError]);

  const [startSession] = useStartSessionMutation();
  const [startTaskSession] = useStartTaskSessionMutation();

  const isConnected = status === 'connected' && connectionState === HubConnectionState.Connected;

  // Connect to the SignalR hub
  const connectToHub = useCallback(async (sid: string) => {
    if (consoleHubService.getConnectionState() === HubConnectionState.Connected) {
      setStatus('connected');
      return;
    }

    try {


      // Setup callbacks before connecting - use refs to get latest callbacks
      consoleHubService.onMessageReceived((data: string) => {
        if (onDataRef.current) {
          onDataRef.current(data);
        }
      });
      if (onErrorRef.current) {
        consoleHubService.onError((error: string) => {
          if (onErrorRef.current) {
            onErrorRef.current(error);
          }
        });
      }
      consoleHubService.onConnectionStateChanged(setConnectionState);

      // Connect to hub
      await consoleHubService.connect(sid, token);

      await consoleHubService.startSession(sid, 80, 24);

      sessionRef.current = {
        sessionId: sid,
        language,
        isConnected: true,
      };

      setStatus('connected');
    } catch (err) {
      console.error('useConsole: Failed to connect to hub', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setStatus('error');
      if (onErrorRef.current) {
        onErrorRef.current(errorMessage);
      }
      throw err;
    }
  }, [token, language]);

  // Initialize session by calling the backend API
  const initializeSession = useCallback(async () => {
    // Prevent duplicate initialization
    if (isConnectingRef.current || hasInitializedRef.current) {
      console.log('useConsole: Initialization already in progress or completed');
      return;
    }

    try {
      isConnectingRef.current = true;
      hasInitializedRef.current = true;
      
      if (!isMountedRef.current) return;
      
      setStatus('booting');
      setError(null);



      // Call appropriate API based on whether we have a taskId
      let result;
      if (taskId) {
        result = await startTaskSession({ taskId }).unwrap();
      } else {
        result = await startSession({ language }).unwrap();
      }

      if (!isMountedRef.current) return;
      

      setSessionId(result.sessionId);

      // Now connect to SignalR with the session ID
      await connectToHub(result.sessionId);

    } catch (err) {
      console.error('useConsole: Failed to initialize session', err);
      
      if (!isMountedRef.current) return;
      
      // Better error message formatting
      let errorMessage = 'Failed to start session';
      if (err && typeof err === 'object') {
        if ('status' in err) {
          errorMessage = `Backend error (${err.status}): ${JSON.stringify(err)}`;
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setStatus('error');
      if (onErrorRef.current) {
        onErrorRef.current(errorMessage);
      }
    } finally {
      isConnectingRef.current = false;
    }
  }, [language, taskId, startSession, startTaskSession, connectToHub]);

  // Disconnect and cleanup
  const disconnect = useCallback(async () => {
    try {

      await consoleHubService.disconnect();
      sessionRef.current = null;
      setConnectionState(HubConnectionState.Disconnected);
      setStatus('idle');
      setSessionId(null);
      setError(null);
      // Reset initialization flag to allow fresh start
      hasInitializedRef.current = false;
      isConnectingRef.current = false;
    } catch (error) {
      console.error('useConsole: Error during disconnect', error);
    }
  }, []);

  // Write command to the container
  const writeCommand = useCallback(
    async (command: string) => {


      if (!isConnected) {
        console.warn('useConsole: Not connected, cannot write command. Status:', status, 'ConnectionState:', connectionState);
        return;
      }

      if (!sessionId) {
        console.error('useConsole: No sessionId available');
        return;
      }

      try {
        await consoleHubService.sendCommand(sessionId, command);
      } catch (error) {
        console.error('useConsole: Failed to write command', error);
        if (onErrorRef.current) {
          onErrorRef.current(`Failed to send command: ${error}`);
        }
      }
    },
    [isConnected, sessionId, status, connectionState]
  );

  // Resize terminal
  const resize = useCallback(
    async (rows: number, cols: number) => {
      if (!isConnected) {
        return;
      }

      try {
        await consoleHubService.resize(sessionId!, rows, cols);
      } catch (error) {
        console.error('useConsole: Failed to resize', error);
      }
    },
    [isConnected, sessionId]
  );

  // Effect: Initialize session on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    initializeSession();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      hasInitializedRef.current = false;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return {
    status,
    isConnected,
    connectionState,
    sessionId,
    writeCommand,
    resize,
    disconnect,
    error,
  };
};
