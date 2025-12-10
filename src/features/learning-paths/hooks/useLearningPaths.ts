import { useAppDispatch, useAppSelector } from "../../../hooks";
import { toast } from "react-hot-toast";
import {
  useGetAllLearningPathsQuery,
  useGetLearningPathByIdQuery,
  useGetCheckpointQuery,
  useCreateLearningPathMutation,
  useUpdateTaskCompletionMutation,
} from "../api";
import {
  setFilter,
  setSortBy,
  toggleSortOrder,
  setSelectedPathId,
  toggleCheckpointExpanded,
  expandAllCheckpoints,
  collapseAllCheckpoints,
  resetFilters,
  type LearningPathsFilter,
  type LearningPathsSortBy,
} from "../store/learningPaths.slice";
import type {
  CreateLearningPathRequest,
  CreateLearningPathResult,
  UpdateTaskResult,
  LearningPath,
} from "../services/type";

/**
 * useLearningPaths Hook - Learning Paths State Management
 *
 * WHAT THIS HOOK PROVIDES:
 * - UI state: filter, sortBy, sortOrder, selectedPathId, expandedCheckpoints
 * - RTK Query hooks: getAllLearningPaths, getLearningPathById, getCheckpoint
 * - Mutations: createLearningPath, updateTaskCompletion
 *
 * EXAMPLE USAGE:
 * ```tsx
 * const {
 *   // UI state
 *   filter, sortBy, sortOrder,
 *   // Actions
 *   handleSetFilter, handleCreatePath, handleToggleTaskCompletion,
 *   // Loading states
 *   isCreating, isUpdating,
 * } = useLearningPaths();
 *
 * // For fetching data, use RTK Query hooks directly
 * const { data: paths, isLoading } = useGetAllLearningPathsQuery();
 * ```
 */
export const useLearningPaths = () => {
  const dispatch = useAppDispatch();

  // Mutations
  const [createPathMutation, { isLoading: isCreating }] =
    useCreateLearningPathMutation();
  const [updateTaskMutation, { isLoading: isUpdating }] =
    useUpdateTaskCompletionMutation();

  // UI State from Redux
  const filter = useAppSelector((state) => state.learningPaths?.filter ?? "all");
  const sortBy = useAppSelector((state) => state.learningPaths?.sortBy ?? "date");
  const sortOrder = useAppSelector(
    (state) => state.learningPaths?.sortOrder ?? "desc"
  );
  const selectedPathId = useAppSelector(
    (state) => state.learningPaths?.selectedPathId ?? null
  );
  const expandedCheckpoints = useAppSelector(
    (state) => state.learningPaths?.expandedCheckpoints ?? []
  );

  /**
   * Create a new learning path
   */
  const createLearningPath = async (
    data: CreateLearningPathRequest
  ): Promise<CreateLearningPathResult> => {
    try {
      const result = await createPathMutation(data).unwrap();
      toast.success("Learning path created successfully! 🎉");
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = "Failed to create learning path. Please try again.";
      toast.error(errorMessage);
      console.error("Create learning path error:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  /**
   * Update task completion status
   */
  const toggleTaskCompletion = async (params: {
    learningPathId: string;
    checkpointId: string;
    taskId: string;
    completed: boolean;
    cacheCheckpointId?: string;
  }): Promise<UpdateTaskResult> => {
    try {
      const result = await updateTaskMutation({
        learningPathId: params.learningPathId,
        data: {
          checkpointId: params.checkpointId,
          taskId: params.taskId,
          completed: params.completed,
        },
        cacheCheckpointId: params.cacheCheckpointId,
      }).unwrap();

      toast.success(
        params.completed
          ? "Task completed! Great job! 🎉"
          : "Task marked as incomplete"
      );

      if (result.progress) {
        toast.success(
          `Progress: ${result.progress.completedTasks}/${result.progress.totalTasks} tasks (${result.progress.percentage}%)`,
          { duration: 4000 }
        );
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = "Failed to update task. Please try again.";
      toast.error(errorMessage);
      console.error("Update task completion error:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  /**
   * Filter and sort learning paths
   */
  const filterAndSortPaths = (paths: LearningPath[]): LearningPath[] => {
    let filtered = [...paths];

    // Apply filter
    switch (filter) {
      case "active":
        filtered = filtered.filter((p) => p.isActive);
        break;
      case "completed":
        filtered = filtered.filter(
          (p) => p.progress && p.progress.percentage >= 100
        );
        break;
    }

    // Apply sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "progress":
          comparison =
            (a.progress?.percentage ?? 0) - (b.progress?.percentage ?? 0);
          break;
        case "date":
        default:
          comparison =
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  // UI State Actions
  const handleSetFilter = (value: LearningPathsFilter) => {
    dispatch(setFilter(value));
  };

  const handleSetSortBy = (value: LearningPathsSortBy) => {
    dispatch(setSortBy(value));
  };

  const handleToggleSortOrder = () => {
    dispatch(toggleSortOrder());
  };

  const handleSetSelectedPath = (id: string | null) => {
    dispatch(setSelectedPathId(id));
  };

  const handleToggleCheckpoint = (checkpointId: string) => {
    dispatch(toggleCheckpointExpanded(checkpointId));
  };

  const handleExpandAll = (checkpointIds: string[]) => {
    dispatch(expandAllCheckpoints(checkpointIds));
  };

  const handleCollapseAll = () => {
    dispatch(collapseAllCheckpoints());
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return {
    // UI State
    filter,
    sortBy,
    sortOrder,
    selectedPathId,
    expandedCheckpoints,

    // Loading states
    isCreating,
    isUpdating,

    // Actions
    createLearningPath,
    toggleTaskCompletion,
    filterAndSortPaths,

    // UI State Actions
    setFilter: handleSetFilter,
    setSortBy: handleSetSortBy,
    toggleSortOrder: handleToggleSortOrder,
    setSelectedPath: handleSetSelectedPath,
    toggleCheckpoint: handleToggleCheckpoint,
    expandAll: handleExpandAll,
    collapseAll: handleCollapseAll,
    resetFilters: handleResetFilters,
  };
};

// Re-export RTK Query hooks for convenience
export {
  useGetAllLearningPathsQuery,
  useGetLearningPathByIdQuery,
  useGetCheckpointQuery,
  useCreateLearningPathMutation,
  useUpdateTaskCompletionMutation,
} from "../api";
