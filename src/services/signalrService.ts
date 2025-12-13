import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

class SignalRService {
  private connection: HubConnection | null = null;
  private url: string = process.env.VITE_NEXT_PUBLIC_SIGNALR_URL!;

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
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      await this.connection.start();
      console.log("SignalR Connected Successfully. Connection ID:", this.connection.connectionId);
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
    }
  };

  public stopConnection = async (): Promise<void> => {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log("SignalR Connection Stopped.");
    }
  };

  public on = (methodName: string, callback: (...args: any[]) => void) => {
    if (this.connection) {
      this.connection.on(methodName, callback);
    }
  };

  public off = (methodName: string, callback: (...args: any[]) => void) => {
    if (this.connection) {
      this.connection.off(methodName, callback);
    }
  };
   
  public getConnectionState = () => {
      return this.connection?.state;
  }
}

export const signalRService = new SignalRService();
