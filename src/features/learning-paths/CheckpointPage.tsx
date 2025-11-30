import { Link, useParams } from "react-router-dom";
import { useGetCheckpointQuery } from "./api";
import { Spinner } from "@/components/ui";
import type { Task } from "@/types/learning-path";

export const CheckpointPage = () => {
  const { id, checkpointId } = useParams<{ id: string; checkpointId: string }>();
  
  const {
    data: checkpoint,
    isLoading,
    error,
  } = useGetCheckpointQuery({
    learningPathId: id!,
    checkpointId: checkpointId!,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !checkpoint) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load checkpoint. Please try again later.
          </p>
        </div>
        <Link
          to={`/learning-paths/${id}`}
          className="inline-block mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          ← Back to Learning Path
        </Link>
      </div>
    );
  }

  const completedTasks = checkpoint.tasks.filter((task: Task) => task.completed).length;
  const totalTasks = checkpoint.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const progressColor = progressPercentage >= 100 ? "bg-green-500 dark:bg-green-500" : "bg-primary-600";
  const progressTextColor = progressPercentage >= 100 ? "text-green-600 dark:text-green-400" : "text-primary-600 dark:text-primary-400";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with improved design */}
      <div className="mb-8">
        <Link
          to={`/learning-paths/${id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Learning Path
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {checkpoint.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {checkpoint.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-8">
              {checkpoint.estimatedDays && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                  <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{checkpoint.estimatedDays} days estimated</span>
                </div>
              )}
              <div className="flex items-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-medium">{totalTasks} tasks</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Checkpoint Progress</span>
                <span className={`font-bold ${progressTextColor}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`${progressColor} h-full rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          Tasks
          <span className="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
            {totalTasks}
          </span>
        </h2>

        {checkpoint.tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700 border-dashed">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No tasks available for this checkpoint yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkpoint.tasks.map((task: Task, index: number) => (
              <Link
                key={task.id}
                to={`/learning-paths/${id}/tasks/${task.id}`}
                state={{ 
                  checkpointId: checkpointId, // Pass the URL param for cache consistency
                  realCheckpointId: checkpoint.id, // Pass the real ID for API calls
                  checkpointTitle: checkpoint.title 
                }}
                className={`group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border p-5 ${
                  task.completed 
                    ? "border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10" 
                    : "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                }`}
              >
                <div className="flex items-center">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 transition-colors ${
                    task.completed
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-500 dark:group-hover:bg-primary-900/20"
                  }`}>
                    {task.completed ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold truncate ${
                      task.completed 
                        ? "text-gray-500 dark:text-gray-400 line-through decoration-gray-400" 
                        : "text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    }`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {task.estimatedTime > 0 && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {task.estimatedTime} min
                        </span>
                      )}
                      {task.type && (
                        <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                          {task.type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <svg className={`w-5 h-5 transform transition-transform group-hover:translate-x-1 ${
                      task.completed ? "text-green-400" : "text-gray-300 group-hover:text-primary-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
