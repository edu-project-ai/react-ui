import type { CodeVerificationResult } from "../api/agentApi";

export type { CodeVerificationResult };

export interface TokenEvent {
  text: string;
}

export interface ToolCallEvent {
  tool: string;
  args: Record<string, unknown>;
}

export interface ToolResultEvent {
  tool: string;
  summary: string;
}

export interface DoneEvent {
  reply: string;
  verification: CodeVerificationResult | null;
  tools_used: string[];
}

export type SSEEvent =
  | { type: "token"; data: TokenEvent }
  | { type: "tool_call"; data: ToolCallEvent }
  | { type: "tool_result"; data: ToolResultEvent }
  | { type: "done"; data: DoneEvent };
