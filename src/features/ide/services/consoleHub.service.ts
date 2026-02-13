import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

/**
 * ConsoleHubService manages the SignalR connection for the Interactive IDE.
 * Provides persistent two-way communication with the Docker container via the backend.
 */
export class ConsoleHubService {
  private connection: HubConnection | null = null;
  private readonly hubUrl: string;
  private sessionId: string | null = null;
  private messageCallback: ((data: string) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;
  private connectionStateCallback: ((state: HubConnectionState) => void) | null = null;

  constructor() {
    // Use API base URL instead of notification hub URL for console hub
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5192';
    this.hubUrl = `${baseUrl}/hubs/console`;
  }

  /**
   * Connects to the ConsoleHub with a specific session ID.
   * @param sessionId - Unique identifier for this terminal session
   * @param token - Authentication token
   */
  async connect(sessionId: string, token: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    // Store sessionId for later use
    this.sessionId = sessionId;



    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?sessionId=${sessionId}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    // Setup event handlers
    this.setupEventHandlers();

    // Setup connection state listeners
    this.connection.onreconnecting((error) => {
      console.warn("ConsoleHub: Reconnecting...", error);
      this.notifyConnectionState(HubConnectionState.Reconnecting);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("ConsoleHub: Reconnected. Connection ID:", connectionId);
      this.notifyConnectionState(HubConnectionState.Connected);
    });

    this.connection.onclose((error) => {
      console.warn("ConsoleHub: Connection closed.", error);
      this.notifyConnectionState(HubConnectionState.Disconnected);
    });

    try {
      await this.connection.start();

      this.notifyConnectionState(HubConnectionState.Connected);
    } catch (error) {
      console.error("ConsoleHub: Connection failed", error);
      throw error;
    }
  }

  /**
   * Starts an interactive session on the backend.
   * @param sessionId - Session/container ID to attach terminal to
   * @param cols - Terminal columns (default 80)
   * @param rows - Terminal rows (default 24)
   */
  async startSession(sessionId: string, cols: number = 80, rows: number = 24): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("Not connected to ConsoleHub");
    }

    try {
      await this.connection.invoke("StartInteractiveSession", sessionId, cols, rows);

    } catch (error) {
      console.error("ConsoleHub: Failed to start session", error);
      throw error;
    }
  }

  /**
   * Sends a command to the container's stdin.
   * @param sessionId - Session ID to send command to
   * @param command - The command/input to send (e.g., "ls\n", "python script.py\n")
   */
  async sendCommand(sessionId: string, command: string): Promise<void> {


    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      console.error("ConsoleHub.sendCommand: Not connected, state:", this.connection?.state);
      return;
    }

    try {

      await this.connection.invoke("SendCommand", sessionId, command);

    } catch (error) {
      console.error("ConsoleHub.sendCommand: Failed to send command", error);
      throw error;
    }
  }

  /**
   * Resizes the terminal in the Docker container.
   * @param sessionId - Session ID to resize
   * @param rows - Number of rows
   * @param cols - Number of columns
   */
  async resize(sessionId: string, rows: number, cols: number): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke("ResizeTerminal", sessionId, cols, rows);

    } catch (error) {
      console.error("ConsoleHub: Failed to resize terminal", error);
    }
  }

  /**
   * Stops the interactive session and cleans up resources.
   * @param sessionId - Session ID to stop
   */
  async stopSession(sessionId: string): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      if (this.connection.state === HubConnectionState.Connected) {
        await this.connection.invoke("StopInteractiveSession", sessionId);
  
      }
    } catch (error) {
      console.error("ConsoleHub: Failed to stop session", error);
    }
  }

  /**
   * Disconnects from the hub and cleans up.
   */
  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      if (this.sessionId) {
        await this.stopSession(this.sessionId);
      }
      await this.connection.stop();

      this.connection = null;
      this.sessionId = null;
      this.notifyConnectionState(HubConnectionState.Disconnected);
    } catch (error) {
      console.error("ConsoleHub: Error during disconnect", error);
    }
  }

  /**
   * Sets up event handlers for receiving messages from the backend.
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Receive terminal output from the Docker container (PTY echo + command output)
    this.connection.on("ReceiveTerminalOutput", (data: string) => {

      if (this.messageCallback) {
        this.messageCallback(data);
      }
    });

    // Receive session log messages (debug/system logs from backend)
    // Format with yellow ANSI color to distinguish from regular output
    this.connection.on("ReceiveSessionLog", (_sessionId: string, logMessage: string) => {

      if (this.messageCallback) {
        // Format as yellow system message
        const formattedMessage = `\x1b[33m[SYSTEM] ${logMessage}\x1b[0m`;
        this.messageCallback(formattedMessage);
      }
    });

    // Receive execution log messages (sent during session creation and code execution)
    // Format with cyan ANSI color for execution logs
    this.connection.on("ReceiveExecutionLog", (_codeRunId: string, logMessage: string) => {

      if (this.messageCallback) {
        // Format as cyan execution message
        const formattedMessage = `\x1b[36m${logMessage}\x1b[0m`;
        this.messageCallback(formattedMessage);
      }
    });

    // Receive error messages
    this.connection.on("ReceiveError", (error: string) => {
      console.error("ConsoleHub: Received error:", error);
      if (this.errorCallback) {
        this.errorCallback(error);
      }
    });
  }

  /**
   * Registers a callback for when terminal output is received.
   * @param callback - Function to call with the output data
   */
  onMessageReceived(callback: (data: string) => void): void {
    this.messageCallback = callback;
  }

  /**
   * Registers a callback for when an error is received.
   * @param callback - Function to call with the error message
   */
  onError(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }

  /**
   * Registers a callback for connection state changes.
   * @param callback - Function to call when connection state changes
   */
  onConnectionStateChanged(callback: (state: HubConnectionState) => void): void {
    this.connectionStateCallback = callback;
  }

  /**
   * Gets the current connection state.
   */
  getConnectionState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }

  /**
   * Notifies registered callback of connection state changes.
   */
  private notifyConnectionState(state: HubConnectionState): void {
    if (this.connectionStateCallback) {
      this.connectionStateCallback(state);
    }
  }
}

// Export a singleton instance
export const consoleHubService = new ConsoleHubService();
