import { apiSlice } from '@/store/api/apiSlice';

/**
 * Response from starting a new interactive session
 */
export interface StartSessionResponse {
  sessionId: string;
  status: string;
}

/**
 * Request to start a new interactive session
 */
export interface StartSessionRequest {
  language: string;
  userId?: string;
}

/**
 * Request to start a task-specific session
 */
export interface StartTaskSessionRequest {
  taskId: string;
}

/**
 * API endpoints for code execution and interactive sessions
 */
export const codeExecutionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startSession: builder.mutation<StartSessionResponse, StartSessionRequest>({
      query: (body) => {
        console.log('Starting session with language:', body.language);
        return {
          url: '/api/code-execution/sessions',
          method: 'POST',
          body: { Language: body.language }, // Backend expects PascalCase
        };
      },
      transformResponse: (response: { containerId: string; userId: string; language: string }) => {
        console.log('Session created:', response);
        return {
          sessionId: response.containerId,
          status: 'created',
        };
      },
    }),

    startTaskSession: builder.mutation<StartSessionResponse, StartTaskSessionRequest>({
      query: (body) => {
        console.log('Starting task session with taskId:', body.taskId);
        return {
          url: '/api/code-execution/sessions/task',
          method: 'POST',
          body: { TaskId: body.taskId }, // Backend expects PascalCase
        };
      },
      transformResponse: (response: {
        containerId: { containerId: string; environmentId: string };
        userId: string;
        taskId: string;
      }) => {
        console.log('Task session created:', response);
        return {
          sessionId: response.containerId.containerId,
          status: 'created',
        };
      },
    }),
  }),
});

export const { useStartSessionMutation, useStartTaskSessionMutation } = codeExecutionApi;
