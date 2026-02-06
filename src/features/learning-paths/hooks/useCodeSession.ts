import { useEffect, useState, useCallback, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { getAuthToken } from "@/lib/token-provider";

/**
 * Session State Machine:
 * Idle -> Provisioning -> Ready -> Running -> Ready (loop) -> Terminated
 */
export type SessionState =
  | "Idle"
  | "Provisioning"
  | "Ready"
  | "Running"
  | "Terminated"
  | "Error";

interface SessionInfo {
  sessionId: string;
  containerId: string;
}

interface UseCodeSessionResult {
  /** Current state of the session lifecycle */
  state: SessionState;
  /** Session info when provisioned */
  session: SessionInfo | null;
  /** Whether SignalR is connected */
  isConnected: boolean;
  /** Real-time execution logs */
  logs: string[];
  /** Error message if any */
  error: string | null;
  /** Run code in the active session */
  runCode: (code: string, language: string, runCommand?: string) => Promise<void>;
  /** Clear accumulated logs */
  clearLogs: () => void;
  /** Send terminal input (keystrokes) to the interactive shell */
  sendTerminalInput: (data: string) => void;
  /** Resize the terminal */
  resizeTerminal: (cols: number, rows: number) => void;
  /** Set the callback for receiving terminal output */
  setTerminalOutputHandler: (handler: (data: string) => void) => void;
}

interface UseCodeSessionOptions {
  /** Task ID to provision container for */
  taskId: string;
  /** Auto-start session on mount */
  autoStart?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5192";

/**
 * Hook for managing Docker container session lifecycle.
 * Handles: Init -> Connect -> Run -> Cleanup
 */
export const useCodeSession = ({
  taskId,
  autoStart = true,
}: UseCodeSessionOptions): UseCodeSessionResult => {
  const [state, setState] = useState<SessionState>("Idle");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connectionRef = useRef<HubConnection | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const terminalOutputHandlerRef = useRef<((data: string) => void) | null>(null);

  const hubUrl = `${API_BASE_URL}/hubs/console`;

  /**
   * Initialize SignalR connection
   */
  const initConnection = useCallback(async (): Promise<HubConnection | null> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setError("No auth token available");
        setState("Error");
        return null;
      }

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();

      // Connection lifecycle handlers
      connection.onreconnecting(() => {
        console.warn("[Session] SignalR reconnecting...");
        setIsConnected(false);
      });

      connection.onreconnected(() => {
        console.log("[Session] SignalR reconnected");
        setIsConnected(true);
        // Rejoin session group after reconnection
        if (sessionIdRef.current) {
          connection.invoke("JoinSessionGroup", sessionIdRef.current).catch(console.error);
        }
      });

      connection.onclose(() => {
        console.warn("[Session] SignalR connection closed");
        setIsConnected(false);
      });

      // Session-specific event handlers
      connection.on("ReceiveSessionLog", (sessionId: string, message: string) => {
        if (sessionId === sessionIdRef.current) {
          setLogs((prev) => [...prev, message]);
        }
      });

      connection.on("ReceiveSessionReady", (sessionId: string, containerId: string) => {
        if (sessionId === sessionIdRef.current) {
          setSession({ sessionId, containerId });
          setState("Ready");
          console.log(`[Session] Container ready: ${containerId}`);
        }
      });

      connection.on("ReceiveSessionTerminated", (sessionId: string) => {
        if (sessionId === sessionIdRef.current) {
          setState("Terminated");
          console.log(`[Session] Session terminated: ${sessionId}`);
        }
      });

      connection.on("ReceiveError", (message: string) => {
        setError(message);
        setLogs((prev) => [...prev, `[ERROR] ${message}`]);
      });

      // Legacy handler for backward compatibility
      connection.on("ReceiveExecutionLog", (_codeRunId: string, message: string) => {
        setLogs((prev) => [...prev, message]);
      });

      // Interactive terminal output
      connection.on("ReceiveTerminalOutput", (sessionId: string, data: string) => {
        if (sessionId === sessionIdRef.current && terminalOutputHandlerRef.current) {
          terminalOutputHandlerRef.current(data);
        }
      });

      await connection.start();
      console.log("[Session] SignalR connected");
      setIsConnected(true);
      connectionRef.current = connection;

      return connection;
    } catch (err) {
      console.error("[Session] Failed to connect SignalR:", err);
      setError("Failed to connect to server");
      setState("Error");
      return null;
    }
  }, [hubUrl]);

  /**
   * Provision a new Docker container session
   */
  const initSession = useCallback(async (): Promise<void> => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    setState("Provisioning");
    setLogs(["⏳ Booting environment..."]);
    setError(null);

    try {
      // Step 1: Establish SignalR connection
      const connection = await initConnection();
      if (!connection) return;

      // Step 2: Call API to provision container
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/code-execution/sessions/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create session: ${errorText}`);
      }

      const data = await response.json();
      const sessionId = data.containerId;
      sessionIdRef.current = sessionId;

      // Step 3: Join SignalR group for this session
      await connection.invoke("JoinSessionGroup", sessionId);

      setSession({ sessionId, containerId: data.containerId });
      setState("Ready");
      setLogs((prev) => [...prev, `✅ Environment ready (${sessionId.slice(0, 12)})`]);

      // Auto-start interactive terminal
      if (connection.state === HubConnectionState.Connected) {
        try {
          await connection.invoke("StartTerminal", sessionId, 80, 24);
          console.log("[Session] Interactive terminal started");
        } catch (err) {
          console.error("[Session] Failed to start terminal:", err);
        }
      }
    } catch (err) {
      console.error("[Session] Init failed:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize session");
      setState("Error");
      setLogs((prev) => [...prev, `❌ ${err instanceof Error ? err.message : "Init failed"}`]);
    }
  }, [taskId, initConnection]);

  /**
   * Run code in the active container session
   */
  const runCode = useCallback(
    async (code: string, language: string, runCommand?: string): Promise<void> => {
      if (state !== "Ready") {
        setError("Session not ready");
        return;
      }

      setState("Running");
      setLogs((prev) => [...prev, "\n▶ Running code..."]);

      try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/code-execution/run`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code, language, runCommand }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Execution failed: ${errorText}`);
        }

        const result = await response.json();
        
        // Append execution result to logs
        if (result.output) {
          setLogs((prev) => [...prev, result.output]);
        }
        if (result.error) {
          setLogs((prev) => [...prev, `[ERROR] ${result.error}`]);
        }

        setLogs((prev) => [...prev, `\n⏱ Completed in ${result.executionTime}`]);
        setState("Ready");
      } catch (err) {
        console.error("[Session] Execution failed:", err);
        setError(err instanceof Error ? err.message : "Execution failed");
        setLogs((prev) => [...prev, `❌ ${err instanceof Error ? err.message : "Execution failed"}`]);
        setState("Ready"); // Reset to ready to allow retry
      }
    },
    [state]
  );

  /**
   * Terminate the session and cleanup
   */
  const terminateSession = useCallback(async (): Promise<void> => {
    const sessionId = sessionIdRef.current;

    // Leave SignalR group
    if (connectionRef.current?.state === HubConnectionState.Connected && sessionId) {
      try {
        await connectionRef.current.invoke("LeaveSessionGroup", sessionId);
      } catch {
        // Ignore errors during cleanup
      }
    }

    // Stop SignalR connection
    if (connectionRef.current) {
      await connectionRef.current.stop().catch(() => {});
      connectionRef.current = null;
    }

    // Call terminate API using fetch with keepalive
    const token = sessionStorage.getItem("auth_token");
    if (token) {
        fetch(`${API_BASE_URL}/api/code-execution/sessions`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            keepalive: true,
        }).catch(() => {});
    }

    setState("Terminated");
    sessionIdRef.current = null;
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /**
   * Send terminal input to the interactive shell
   */
  const sendTerminalInput = useCallback((data: string) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId || !connectionRef.current || connectionRef.current.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      try { console.debug('[Session] invoke SendTerminalInput', { sessionId, data }); } catch (e) { }
      connectionRef.current.invoke("SendTerminalInput", sessionId, data).catch((err) => {
        console.error("[Session] Failed to send terminal input:", err);
      });
    } catch (err) {
      console.error("[Session] Error invoking SendTerminalInput:", err);
    }
  }, []);

  /**
   * Resize the terminal
   */
  const resizeTerminal = useCallback((cols: number, rows: number) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId || !connectionRef.current || connectionRef.current.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      connectionRef.current.invoke("ResizeTerminal", sessionId, cols, rows).catch((err) => {
        console.error("[Session] Failed to resize terminal:", err);
      });
    } catch (err) {
      console.error("[Session] Error invoking ResizeTerminal:", err);
    }
  }, []);

  /**
   * Set the handler for receiving terminal output
   */
  const setTerminalOutputHandler = useCallback((handler: (data: string) => void) => {
    terminalOutputHandlerRef.current = handler;
  }, []);

  // Auto-start session on mount
  useEffect(() => {
    if (autoStart && taskId) {
      initSession();
    }

    // Cleanup on unmount
    return () => {
      terminateSession();
    };
  }, [autoStart, taskId, initSession, terminateSession]);

  return {
    state,
    session,
    isConnected,
    logs,
    error,
    runCode,
    clearLogs,
    sendTerminalInput,
    resizeTerminal,
    setTerminalOutputHandler,
  };
};
