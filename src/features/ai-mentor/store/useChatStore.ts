import { create } from "zustand";
import type { ToolCallEvent } from "../types/sseEvents";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  partialText: string;
  toolCalls: ToolCallEvent[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setStreaming: (v: boolean) => void;
  setPartialText: (text: string) => void;
  appendToolCall: (event: ToolCallEvent) => void;
  clearStreamingState: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  partialText: "",
  toolCalls: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  setStreaming: (v) => set({ isStreaming: v }),
  setPartialText: (text) => set({ partialText: text }),
  appendToolCall: (event) => set((state) => ({ toolCalls: [...state.toolCalls, event] })),
  clearStreamingState: () => set({ isStreaming: false, partialText: "", toolCalls: [] }),
}));
