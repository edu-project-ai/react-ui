import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGetCheckpointQuery, useUpdateTaskCompletionMutation } from "./api";
import { Spinner } from "@/components/ui";
import { toast } from "react-hot-toast";
import type { Task } from "@/types/learning-path";

export const TaskDetailPage = () => {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get checkpointId from location state (passed from CheckpointPage)
  const { checkpointId, realCheckpointId, checkpointTitle } = (location.state as {
    checkpointId?: string;
    realCheckpointId?: string;
    checkpointTitle?: string;
  }) || {};

  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch checkpoint data to get task details
  // Use checkpointId (e.g. 'cp-1') if available to match CheckpointPage cache
  const {
    data: checkpoint,
    isLoading,
    error,
  } = useGetCheckpointQuery(
    {
      learningPathId: id!,
      checkpointId: checkpointId!,
    },
    { skip: !checkpointId }
  );

  const [updateTaskCompletion] = useUpdateTaskCompletionMutation();

  // Find the specific task
  const task = checkpoint?.tasks.find((t: Task) => t.id === taskId);

  const handleToggleCompletion = async () => {
    if (!task || !checkpointId) return;

    setIsUpdating(true);
    try {
      // Use realCheckpointId (UUID) for the API call if available, otherwise fallback to checkpointId
      const apiCheckpointId = realCheckpointId || checkpointId;
      
      const result = await updateTaskCompletion({
        learningPathId: id!,
        data: {
          checkpointId: apiCheckpointId,
          taskId: task.id,
          completed: !task.completed,
        },
        // Pass the cache key ID (e.g. 'cp-1') for optimistic updates
        cacheCheckpointId: checkpointId,
      }).unwrap();

      toast.success(
        task.completed
          ? "Task marked as incomplete"
          : "Task completed! Great job! 🎉"
      );

      // Show progress update
      if (result.progress) {
        toast.success(
          `Progress: ${result.progress.completedTasks}/${result.progress.totalTasks} tasks (${result.progress.percentage}%)`,
          { duration: 4000 }
        );
      }
    } catch (error) {
      console.error("Failed to update task completion:", error);
      toast.error("Failed to update task. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGoBack = () => {
    if (checkpointId) {
      navigate(`/learning-paths/${id}/checkpoints/${checkpointId}`);
    } else {
      navigate(`/learning-paths/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !checkpoint || !task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load task details. Please try again later.
          </p>
        </div>
        <button
          onClick={handleGoBack}
          className="inline-block mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          ← Back to Checkpoint
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Checkpoint
        </button>

        {checkpointTitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
            {checkpointTitle}
          </p>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {task.title}
                </h1>
                
                {/* Task metadata */}
                <div className="flex flex-wrap gap-3 text-sm">
                  {task.type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {task.type}
                    </span>
                  )}
                  {task.estimatedTime > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {task.estimatedTime} min
                    </span>
                  )}
                  {task.difficulty && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 capitalize">
                      {task.difficulty}
                    </span>
                  )}
                  {task.language && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      {task.language}
                    </span>
                  )}
                </div>
              </div>

              {/* Completion status badge */}
              <div className="ml-4 flex-shrink-0">
                {task.completed ? (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                    In Progress
                  </span>
                )}
              </div>
            </div>

            {/* Completion button */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleToggleCompletion}
                disabled={isUpdating}
                className={`w-full md:w-auto min-w-[200px] py-3 px-6 rounded-lg font-medium transition-all transform active:scale-95 ${
                  task.completed
                    ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                    : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl shadow-primary-600/20"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
              >
                {isUpdating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : task.completed ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Mark as Incomplete
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark as Completed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resources section (if available) */}
      {task.resources && Object.keys(task.resources).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Resources
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto font-mono">
                {JSON.stringify(task.resources, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
