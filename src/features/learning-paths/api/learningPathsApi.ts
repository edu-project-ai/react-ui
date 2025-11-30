import { apiSlice } from "@/store/api/apiSlice";
import type {
  LearningPath,
  CheckpointDetail,
  TaskCompletionRequest,
  TaskCompletionResponse,
} from "@/types/learning-path";

/**
 * Learning Paths API - Backend Data Operations
 * This API handles all learning paths, checkpoints, and tasks operations using RTK Query.
 */
export const learningPathsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
        data: TaskCompletionRequest;
        // Optional: ID used in the cache key if different from data.checkpointId (e.g. 'cp-1' vs UUID)
        cacheCheckpointId?: string; 
      }
    >({
      query: ({ learningPathId, data }) => ({
        url: `/api/learning-paths/${learningPathId}/tasks/completion`,
        method: "PUT",
        body: data,
      }),
      async onQueryStarted({ learningPathId, data, cacheCheckpointId }, { dispatch, queryFulfilled }) {
        // Optimistic update for getCheckpoint
        // We try to update both the data.checkpointId (UUID) and cacheCheckpointId (e.g. cp-1) if provided
        const checkpointIdsToUpdate = [data.checkpointId];
        if (cacheCheckpointId && cacheCheckpointId !== data.checkpointId) {
          checkpointIdsToUpdate.push(cacheCheckpointId);
        }

        const patchResults = checkpointIdsToUpdate.map(checkpointId => 
          dispatch(
            learningPathsApi.util.updateQueryData(
              "getCheckpoint",
              { learningPathId, checkpointId },
              (draft) => {
                const task = draft.tasks.find((t) => t.id === data.taskId);
                if (task) {
                  task.completed = data.completed;
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach(patch => patch.undo());
        }
      },
      // Invalidate all related caches after task completion
      invalidatesTags: (_result, _error, { learningPathId, data }) => [
        { type: "LearningPath", id: learningPathId },
        { type: "LearningPath", id: `${learningPathId}-${data.checkpointId}` },
        { type: "LearningPath", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAllLearningPathsQuery,
  useGetLearningPathByIdQuery,
  useGetCheckpointQuery,
  useUpdateTaskCompletionMutation,
} = learningPathsApi;
