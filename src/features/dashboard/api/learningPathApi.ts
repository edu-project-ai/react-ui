import { apiSlice } from "@/store/api/apiSlice";
import type { Checkpoint, CheckpointDetail, LearningPath } from "@/types/learning-path";

export const learningPathApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLearningPaths: builder.query<LearningPath[], void>({
      query: () => "api/learning-paths",
      providesTags: ["LearningPath"],
    }),
    getLearningPath: builder.query<LearningPath, string>({
      query: (id) => `api/learning-paths/${id}`,
      providesTags: (_result, _error, id) => [{ type: "LearningPath", id }],
    }),
    getCheckpoint: builder.query<
      Checkpoint,
      { learningPathId: string; checkpointId: string }
    >({
      query: ({ learningPathId, checkpointId }) =>
        `api/learning-paths/${learningPathId}/checkpoints/${checkpointId}`,
    }),
    getCheckpointByIndex: builder.query<
      CheckpointDetail,
      { learningPathId: string; checkpointIndex: number }
    >({
      query: ({ learningPathId, checkpointIndex }) =>
        `api/learning-paths/${learningPathId}/checkpoints/${checkpointIndex}`,
    }),
  }),
});

export const {
  useGetLearningPathsQuery,
  useGetLearningPathQuery,
  useGetCheckpointQuery,
  useGetCheckpointByIndexQuery,
} = learningPathApi;
