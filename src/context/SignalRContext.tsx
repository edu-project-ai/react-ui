import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppSelector } from "@/hooks";
import { getAuthToken } from "@/lib/token-provider";
import { signalRService } from "../services/signalrService";

interface SignalRContextType {
  isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextType>({ isConnected: false });

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const start = async () => {
        const token = await getAuthToken();
        if (token) {
           await signalRService.startConnection(token);
           setIsConnected(true);
        }
      };

      start();

      return () => {
         // signalRService.stopConnection();
      };
    }
  }, [isAuthenticated]);

  return (
    <SignalRContext.Provider value={{ isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};
