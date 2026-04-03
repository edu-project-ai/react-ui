import { useCallback, useRef } from "react";
import { startAgentStream } from "../api/agentStreamApi";
import {
  useLazyGetConversationHistoryQuery,
  useSaveConversationTurnMutation,
} from "../api/conversationsApi";
import { useChatStore } from "../store/useChatStore";
import type { ToolCallEvent } from "../types/sseEvents";

export function useAgentStream() {
  const abortRef = useRef<AbortController | null>(null);

  const addMessage = useChatStore((s) => s.addMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const setPartialText = useChatStore((s) => s.setPartialText);
  const appendToolCall = useChatStore((s) => s.appendToolCall);
  const clearStreamingState = useChatStore((s) => s.clearStreamingState);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const partialText = useChatStore((s) => s.partialText);
  const toolCalls = useChatStore((s) => s.toolCalls) as ToolCallEvent[];

  const [fetchHistory] = useLazyGetConversationHistoryQuery();
  const [saveConversationTurn] = useSaveConversationTurnMutation();

  const startStream = useCallback(
    async (message: string, taskId?: string | null, taskType?: string) => {
      // Cancel any in-flight stream before starting a new one
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      clearStreamingState();
      setStreaming(true);

      // Load conversation history for context (non-fatal if it fails)
      let history: Array<{ role: string; content: string }> = [];
      try {
        const result = await fetchHistory({ taskId, limit: 20 });
        if (result.data) {
          history = result.data.map((m) => ({ role: m.role, content: m.content }));
        }
      } catch {
        // history unavailable — proceed without context
      }

      let accumulated = "";
      let handled = false;

      try {
        await startAgentStream(
          { message, taskId, taskType: taskType ?? "general", history },
          {
            onToken({ text }) {
              accumulated += text;
              setPartialText(accumulated);
            },
            onToolCall(event) {
              appendToolCall(event);
            },
            onToolResult() {
              // Tool result summary not tracked separately — tool call entry is sufficient
            },
            onDone(event) {
              handled = true;
              addMessage({ role: "assistant", content: event.reply });
              clearStreamingState();
              // Persist turn to backend (fire-and-forget, non-fatal)
              saveConversationTurn({
                codingTaskId: taskId ?? null,
                userMessage: message,
                assistantReply: event.reply,
                toolsUsed: event.tools_used ?? null,
              }).catch(() => {});
            },
            onError(err) {
              handled = true;
              if (err.name !== "AbortError") {
                addMessage({
                  role: "assistant",
                  content: "Sorry, I'm having trouble responding right now. Please try again.",
                });
              }
              clearStreamingState();
            },
          },
          controller.signal,
        );
      } catch {
        // onerror in agentStreamApi rethrows to stop auto-retry;
        // only clean up if onError callback didn't already handle it
        if (!handled) {
          clearStreamingState();
        }
      }
    },
    [addMessage, setStreaming, setPartialText, appendToolCall, clearStreamingState, fetchHistory, saveConversationTurn],
  );

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    clearStreamingState();
  }, [clearStreamingState]);

  return { startStream, cancelStream, isStreaming, partialText, toolCalls };
}
