import { apiSlice } from "@/store/api/apiSlice";

export interface ConversationMessageDto {
  id: string;
  userId: string;
  codingTaskId: string | null;
  role: string;
  content: string;
  toolsUsed: string[] | null;
  createdAt: string;
}

export interface SaveConversationTurnRequest {
  codingTaskId?: string | null;
  userMessage: string;
  assistantReply: string;
  toolsUsed?: string[] | null;
}

export const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversationHistory: builder.query<
      ConversationMessageDto[],
      { taskId?: string | null; limit?: number }
    >({
      query: ({ taskId, limit = 20 }) => ({
        url: "/api/conversations/history",
        params: { ...(taskId ? { taskId } : {}), limit },
      }),
      providesTags: ["Conversation"],
    }),
    saveConversationTurn: builder.mutation<
      ConversationMessageDto[],
      SaveConversationTurnRequest
    >({
      query: (body) => ({
        url: "/api/conversations/turn",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversation"],
    }),
  }),
});

export const {
  useLazyGetConversationHistoryQuery,
  useSaveConversationTurnMutation,
} = conversationsApi;
