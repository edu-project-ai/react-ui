import { apiSlice } from "@/store/api/apiSlice";

export interface AgentChatRequest {
  userMessage: string;
  taskType: string;
  taskInstruction: string;
  currentCode?: string | null;
  language?: string | null;
  taskId?: string | null;
}

export interface AgentChatResponse {
  reply: string;
}

export const agentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    agentChat: builder.mutation<AgentChatResponse, AgentChatRequest>({
      query: (data) => ({
        url: "/api/agent/chat",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useAgentChatMutation } = agentApi;
