import { useCallback, useRef } from "react";
import { startAgentStream } from "../api/agentStreamApi";
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

  const startStream = useCallback(
    async (message: string, taskId?: string | null, taskType?: string) => {
      // Cancel any in-flight stream before starting a new one
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      clearStreamingState();
      setStreaming(true);

      let accumulated = "";
      let handled = false;

      try {
        await startAgentStream(
          { message, taskId, taskType: taskType ?? "general" },
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
    [addMessage, setStreaming, setPartialText, appendToolCall, clearStreamingState],
  );

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    clearStreamingState();
  }, [clearStreamingState]);

  return { startStream, cancelStream, isStreaming, partialText, toolCalls };
}
