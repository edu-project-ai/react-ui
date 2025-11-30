import { Link, useParams } from "react-router-dom";
import { useGetLearningPathByIdQuery } from "./api";
import { Spinner } from "@/components/ui";
import type { Checkpoint } from "@/types/learning-path";

export const LearningPathDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: learningPath, isLoading, error } = useGetLearningPathByIdQuery(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load learning path. Please try again later.
          </p>
        </div>
        <Link
          to="/learning-paths"
          className="inline-block mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          ← Back to Learning Paths
        </Link>
      </div>
    );
  }

  const overallProgressColor = learningPath.progress
    ? learningPath.progress.percentage >= 100
      ? "bg-green-500 dark:bg-green-500"
      : "bg-primary-600"
    : "bg-primary-600";
  const overallTextColor = learningPath.progress
    ? learningPath.progress.percentage >= 100
      ? "text-green-600 dark:text-green-400"
      : "text-primary-600 dark:text-primary-400"
    : "text-primary-600 dark:text-primary-400";

  const isCompleted = learningPath.progress && learningPath.progress.percentage >= 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <Link
          to="/learning-paths"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Learning Paths
        </Link>

        <div className={`rounded-2xl shadow-sm border overflow-hidden ${
          isCompleted
            ? "bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        }`}>
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {learningPath.title}
                  </h1>
                  {learningPath.isActive && (
                    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wide rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {learningPath.description}
                </p>
              </div>
              
              {/* Stats Card */}
              <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 min-w-[200px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">{learningPath.difficultyLevel}</span>
                  </div>
                  {learningPath.estimatedDays && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Estimated</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{learningPath.estimatedDays} days</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Checkpoints</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{learningPath.checkpoints.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {learningPath.progress && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                  <span className={`font-bold ${overallTextColor}`}>
                    {learningPath.progress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${overallProgressColor} h-full rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${learningPath.progress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {learningPath.progress.completedTasks} of {learningPath.progress.totalTasks} tasks completed
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Checkpoints Timeline */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Your Roadmap
        </h2>

        {learningPath.checkpoints.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700 border-dashed">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No checkpoints available for this learning path.
            </p>
          </div>
        ) : (
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent dark:before:via-gray-700">
            {learningPath.checkpoints.map((checkpoint: Checkpoint, index: number) => {
              const checkpointId = checkpoint.id || `cp-${index + 1}`;
              const isCompleted = checkpoint.completed;
              
              return (
                <div key={checkpoint.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 md:left-1/2 w-10 h-10 border-4 rounded-full flex items-center justify-center shadow-sm z-10 transform -translate-x-1/2 md:translate-x-[-50%] transition-colors duration-300 ${
                    isCompleted 
                      ? "bg-green-500 border-green-100 dark:border-green-900" 
                      : "bg-white dark:bg-gray-900 border-primary-100 dark:border-primary-900"
                  }`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                    )}
                  </div>

                  {/* Card */}
                  <Link
                    to={`/learning-paths/${id}/checkpoints/${checkpointId}`}
                    className={`ml-12 md:ml-0 md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-6 border group-hover:border-primary-300 dark:group-hover:border-primary-700 ${
                      isCompleted 
                        ? "border-green-200 dark:border-green-900/30" 
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isCompleted ? "text-green-600 dark:text-green-400" : "text-primary-600 dark:text-primary-400"
                      }`}>
                        Checkpoint {index + 1}
                      </span>
                      {checkpoint.estimatedDays && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {checkpoint.estimatedDays} days
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {checkpoint.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {checkpoint.description}
                    </p>
                    
                    <div className={`flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform ${
                      isCompleted ? "text-green-600 dark:text-green-400" : "text-primary-600 dark:text-primary-400"
                    }`}>
                      {isCompleted ? "Review Tasks" : "View Tasks"}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
