import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

type ConnectionStateCallback = (state: HubConnectionState) => void;

class SignalRService {
  private connection: HubConnection | null = null;
  private url: string = import.meta.env.VITE_NEXT_PUBLIC_SIGNALR_URL!;
  private stateCallbacks: ConnectionStateCallback[] = [];
  private registeredEvents: Map<string, Set<string>> = new Map();

  public startConnection = async (token: string): Promise<void> => {
    try {
      if (this.connection?.state === HubConnectionState.Connected) {
        console.log("SignalR Connection already established.");
        return;
      }

      console.log("Starting SignalR connection...");
      this.connection = new HubConnectionBuilder()
        .withUrl(this.url, {
          accessTokenFactory: () => {
             console.log("SignalR: Providing Access Token");
             return token;
          },
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Explicit reconnect intervals
        .configureLogging(LogLevel.Information)
        .build();

      // Setup connection state listeners
      this.connection.onreconnecting((error) => {
        console.warn("SignalR: Reconnecting...", error);
        this.notifyStateChange(HubConnectionState.Reconnecting);
      });

      this.connection.onreconnected((connectionId) => {
        console.log("SignalR: Reconnected. New Connection ID:", connectionId);
        this.notifyStateChange(HubConnectionState.Connected);
      });

      this.connection.onclose((error) => {
        console.warn("SignalR: Connection closed.", error);
        this.notifyStateChange(HubConnectionState.Disconnected);
      });

      await this.connection.start();
      console.log("SignalR Connected Successfully. Connection ID:", this.connection.connectionId);
      this.notifyStateChange(HubConnectionState.Connected);
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      this.notifyStateChange(HubConnectionState.Disconnected);
    }
  };

  public stopConnection = async (): Promise<void> => {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.registeredEvents.clear();
      console.log("SignalR Connection Stopped.");
    }
  };

  /**
   * Subscribe to an event with defensive case handling.
   * Automatically subscribes to both PascalCase and camelCase variants
   * to handle potential backend serialization inconsistencies.
   */
  public on = (methodName: string, callback: (...args: unknown[]) => void) => {
    if (this.connection) {
      const variants = this.getMethodNameVariants(methodName);
      
      // Track which variants we're registering for this method
      if (!this.registeredEvents.has(methodName)) {
        this.registeredEvents.set(methodName, new Set());
      }
      
      variants.forEach((variant) => {
        if (!this.registeredEvents.get(methodName)?.has(variant)) {
          this.connection!.on(variant, callback);
          this.registeredEvents.get(methodName)!.add(variant);
        }
      });
    }
  };

  /**
   * Unsubscribe from an event (handles all case variants).
   */
  public off = (methodName: string, callback: (...args: unknown[]) => void) => {
    if (this.connection) {
      const registeredVariants = this.registeredEvents.get(methodName);
      if (registeredVariants) {
        registeredVariants.forEach((variant) => {
          this.connection!.off(variant, callback);
        });
        this.registeredEvents.delete(methodName);
      }
    }
  };
   
  public getConnectionState = (): HubConnectionState | undefined => {
    return this.connection?.state;
  };

  /**
   * Register a callback to be notified of connection state changes.
   */
  public onStateChange = (callback: ConnectionStateCallback): (() => void) => {
    this.stateCallbacks.push(callback);
    return () => {
      this.stateCallbacks = this.stateCallbacks.filter((cb) => cb !== callback);
    };
  };

  private notifyStateChange = (state: HubConnectionState): void => {
    this.stateCallbacks.forEach((cb) => cb(state));
  };

  /**
   * Get both PascalCase and camelCase variants of a method name.
   */
  private getMethodNameVariants = (methodName: string): string[] => {
    const camelCase = methodName.charAt(0).toLowerCase() + methodName.slice(1);
    const pascalCase = methodName.charAt(0).toUpperCase() + methodName.slice(1);
    
    // Return unique variants only
    const variants = new Set([methodName, camelCase, pascalCase]);
    return Array.from(variants);
  };
}

export const signalRService = new SignalRService();
