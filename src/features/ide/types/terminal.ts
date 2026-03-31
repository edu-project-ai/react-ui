export type TerminalStatus = 'idle' | 'booting' | 'connected' | 'error';

export interface ConsoleMessage {
  type: 'output' | 'error' | 'system';
  data: string;
  timestamp: Date;
}

export interface TerminalSize {
  rows: number;
  cols: number;
}

export interface SessionInfo {
  sessionId: string;
  language: string;
  isConnected: boolean;
}
