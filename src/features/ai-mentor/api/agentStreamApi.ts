import { fetchEventSource } from "@microsoft/fetch-event-source";
import { getAuthToken } from "@/lib/token-provider";
import type { DoneEvent, TokenEvent, ToolCallEvent, ToolResultEvent } from "../types/sseEvents";

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL as string;

export interface AgentStreamCallbacks {
  onToken: (event: TokenEvent) => void;
  onToolCall: (event: ToolCallEvent) => void;
  onToolResult: (event: ToolResultEvent) => void;
  onDone: (event: DoneEvent) => void;
  onError?: (err: Error) => void;
}

export interface AgentStreamParams {
  message: string;
  taskId?: string | null;
  taskType?: string;
  correlationId?: string;
}

export async function startAgentStream(
  params: AgentStreamParams,
  callbacks: AgentStreamCallbacks,
  signal: AbortSignal,
): Promise<void> {
  const token = await getAuthToken();

  const body = JSON.stringify({
    message: params.message,
    task_id: params.taskId ?? null,
    task_type: params.taskType ?? "general",
    correlation_id: params.correlationId ?? null,
  });

  await fetchEventSource(`${PYTHON_API_URL}/api/agent/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
    signal,
    onmessage(msg) {
      if (!msg.data) return;
      try {
        const data = JSON.parse(msg.data);
        switch (msg.event) {
          case "token":
            callbacks.onToken(data as TokenEvent);
            break;
          case "tool_call":
            callbacks.onToolCall(data as ToolCallEvent);
            break;
          case "tool_result":
            callbacks.onToolResult(data as ToolResultEvent);
            break;
          case "done":
            callbacks.onDone(data as DoneEvent);
            break;
        }
      } catch {
        // malformed SSE data — skip silently
      }
    },
    onerror(err) {
      callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err; // rethrow to stop fetchEventSource auto-retry
    },
  });
}
