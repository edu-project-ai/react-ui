import { useEffect, useState, useCallback, useRef } from "react";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { getAuthToken } from "@/lib/token-provider";

interface UseCodeExecutionResult {
  isConnected: boolean;
  isConnecting: boolean;
  logs: string[];
  subscribeToSession: (userId: string) => Promise<void>;
  clearLogs: () => void;
}

/**
 * Custom hook for managing SignalR connection to ConsoleHub
 * Handles real-time code execution logs streaming from backend
 */
export const useCodeExecution = (): UseCodeExecutionResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5192";
  const hubUrl = `${baseUrl}/consoleHub`;

  useEffect(() => {
    const initConnection = async () => {
      try {
        setIsConnecting(true);
        const token = await getAuthToken();

        if (!token) {
          console.error("useCodeExecution: No auth token available");
          setIsConnecting(false);
          return;
        }

        // Build the connection
        const connection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
          .configureLogging(LogLevel.Information)
          .build();

        // Setup event listeners
        connection.onreconnecting((error) => {
          console.warn("ConsoleHub: Reconnecting...", error);
          setIsConnected(false);
        });

        connection.onreconnected((connectionId) => {
          console.log("ConsoleHub: Reconnected. Connection ID:", connectionId);
          setIsConnected(true);
        });

        connection.onclose((error) => {
          console.warn("ConsoleHub: Connection closed.", error);
          setIsConnected(false);
        });

        // Register the ReceiveNotification event handler
        connection.on("ReceiveNotification", (message: string) => {
          console.log("ConsoleHub: Received notification:", message);
          setLogs((prevLogs) => [...prevLogs, message]);
        });

        // Start the connection
        await connection.start();
        console.log("ConsoleHub: Connected successfully. Connection ID:", connection.connectionId);
        
        connectionRef.current = connection;
        setIsConnected(true);
      } catch (error) {
        console.error("ConsoleHub: Failed to establish connection:", error);
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    initConnection();

    // Cleanup on unmount
    return () => {
      const connection = connectionRef.current;
      if (connection) {
        console.log("ConsoleHub: Cleaning up connection...");
        
        // Remove event handlers
        connection.off("ReceiveNotification");
        
        // Stop the connection
        connection.stop().then(() => {
          console.log("ConsoleHub: Connection stopped.");
          connectionRef.current = null;
        }).catch((error) => {
          console.error("ConsoleHub: Error stopping connection:", error);
        });
      }
    };
  }, [hubUrl]);

  /**
   * Subscribe to a specific user session
   * This adds the user to a SignalR group identified by userId
   */
  const subscribeToSession = useCallback(async (userId: string) => {
    const connection = connectionRef.current;
    
    if (!connection || connection.state !== HubConnectionState.Connected) {
      console.error("ConsoleHub: Cannot subscribe - connection not established");
      return;
    }

    try {
      // Invoke the backend method to join the group
      // This should match the backend: Groups.AddToGroupAsync(userId)
      await connection.invoke("SubscribeToUserSession", userId);
      console.log(`ConsoleHub: Subscribed to session for user: ${userId}`);
    } catch (error) {
      console.error("ConsoleHub: Failed to subscribe to session:", error);
    }
  }, []);

  /**
   * Clear accumulated logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    isConnected,
    isConnecting,
    logs,
    subscribeToSession,
    clearLogs,
  };
};
