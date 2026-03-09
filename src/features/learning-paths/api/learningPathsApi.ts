import { apiSlice } from "@/store/api/apiSlice";
import type {
  LearningPath,
  CheckpointDetail,
  TaskCompletionResponse,
  CreateLearningPathRequest,
  CreateLearningPathResponse,
  TheoryResourceDetail,
  CodingTaskDetail,
  QuizDetail,
  QuizSubmitRequest,
  QuizSubmitResult,
  ResourceItem,
} from "../services/type";

/**
 * Learning Paths API - Backend Data Operations
 * This API handles all learning paths, checkpoints, and tasks operations using RTK Query.
 */
export const learningPathsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new learning path
    createLearningPath: builder.mutation<CreateLearningPathResponse, CreateLearningPathRequest>({
      query: (data) => ({
        url: "/api/learning-paths",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "LearningPath", id: "LIST" }],
    }),

    // Get all learning paths for current user
    getAllLearningPaths: builder.query<LearningPath[], void>({
      query: () => "/api/learning-paths",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "LearningPath" as const,
                id,
              })),
              { type: "LearningPath", id: "LIST" },
            ]
          : [{ type: "LearningPath", id: "LIST" }],
    }),

    // Get learning path by ID with all checkpoints
    getLearningPathById: builder.query<LearningPath, string>({
      query: (id) => `/api/learning-paths/${id}`,
      providesTags: (_result, _error, id) => [{ type: "LearningPath", id }],
    }),

    // Get checkpoint details with tasks
    getCheckpoint: builder.query<
      CheckpointDetail,
      { learningPathId: string; checkpointId: string }
    >({
      query: ({ learningPathId, checkpointId }) =>
        `/api/learning-paths/${learningPathId}/checkpoints/${checkpointId}`,
      providesTags: (_result, _error, { learningPathId, checkpointId }) => [
        { type: "LearningPath", id: learningPathId },
        { type: "LearningPath", id: `${learningPathId}-${checkpointId}` },
      ],
    }),

    // Update task completion status
    updateTaskCompletion: builder.mutation<
      TaskCompletionResponse,
      { 
        learningPathId: string;
        itemId: string;
        data: { completed: boolean };
      }
    >({
      query: ({ learningPathId, itemId, data }) => ({
        url: `/api/learning-paths/${learningPathId}/items/${itemId}/completion`,
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Handle error
        }
      },
      // Invalidate all related caches after task completion
      invalidatesTags: (_result, _error, { learningPathId }) => [
        { type: "LearningPath", id: learningPathId },
        { type: "LearningPath", id: "LIST" },
      ],
    }),

    // Get theory resource details (lazy loaded)
    getTheoryResource: builder.query<
      TheoryResourceDetail,
      { learningPathId: string; itemId: string }
    >({
      query: ({ learningPathId, itemId }) =>
        `/api/learning-paths/${learningPathId}/items/${itemId}/theory-resource`,
      providesTags: (_result, _error, { learningPathId, itemId }) => [
        { type: "LearningPath", id: `${learningPathId}-item-${itemId}` },
      ],
    }),

    // Get coding task details (lazy loaded)
    getCodingTask: builder.query<
      CodingTaskDetail,
      { learningPathId: string; itemId: string }
    >({
      query: ({ learningPathId, itemId }) =>
        `/api/learning-paths/${learningPathId}/items/${itemId}/coding-task`,
      providesTags: (_result, _error, { learningPathId, itemId }) => [
        { type: "LearningPath", id: `${learningPathId}-item-${itemId}` },
      ],
    }),

    // Get quiz details (lazy loaded)
    getQuiz: builder.query<
      QuizDetail,
      { learningPathId: string; itemId: string }
    >({
      query: ({ learningPathId, itemId }) =>
        `/api/learning-paths/${learningPathId}/items/${itemId}/quiz`,
      providesTags: (_result, _error, { learningPathId, itemId }) => [
        { type: "LearningPath", id: `${learningPathId}-item-${itemId}` },
      ],
    }),

    // Submit a quiz answer for a single question
    submitQuizAnswer: builder.mutation<
      QuizSubmitResult,
      { learningPathId: string; itemId: string; data: QuizSubmitRequest }
    >({
      query: ({ learningPathId, itemId, data }) => ({
        url: `/api/learning-paths/${learningPathId}/items/${itemId}/quiz/submit`,
        method: "POST",
        body: data,
      }),
    }),

    // Update learning path active status (activate / deactivate)
    updateLearningPathStatus: builder.mutation<
      LearningPath,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/api/learning-paths/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "LearningPath", id },
        { type: "LearningPath", id: "LIST" },
      ],
    }),

    // Get resources for a theory learning item
    getItemResources: builder.query<
      ResourceItem[],
      { learningPathId: string; itemId: string }
    >({
      query: ({ learningPathId, itemId }) =>
        `/api/learning-paths/${learningPathId}/items/${itemId}/resources`,
    }),

    // Get a single resource by ID
    getResourceById: builder.query<ResourceItem, string>({
      query: (id) => `/api/resources/${id}`,
    }),

    // Get all resources in the system
    getAllResources: builder.query<ResourceItem[], void>({
      query: () => `/api/resources`,
    }),

  }),
});

// Export hooks for usage in components
export const {
  useGetAllLearningPathsQuery,
  useGetLearningPathByIdQuery,
  useGetCheckpointQuery,
  useUpdateTaskCompletionMutation,
  useCreateLearningPathMutation,
  useGetTheoryResourceQuery,
  useGetCodingTaskQuery,
  useGetQuizQuery,
  useSubmitQuizAnswerMutation,
  useUpdateLearningPathStatusMutation,
  useGetItemResourcesQuery,
  useGetResourceByIdQuery,
  useGetAllResourcesQuery,
} = learningPathsApi;
