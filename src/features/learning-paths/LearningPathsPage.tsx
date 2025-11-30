import { Link } from "react-router-dom";
import { useGetAllLearningPathsQuery } from "./api";
import { Spinner } from "@/components/ui";
import type { LearningPath } from "@/types/learning-path";

export const LearningPathsPage = () => {
  const { data: learningPaths, isLoading, error } = useGetAllLearningPathsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load learning paths. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Your Learning Journey
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Master new skills with structured roadmaps tailored to your goals.
        </p>
      </div>

      {!learningPaths || learningPaths.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have any learning paths yet.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {learningPaths.map((path: LearningPath) => {
            const isCompleted = path.progress && path.progress.percentage >= 100;
            const progressColor = isCompleted ? "bg-green-500 dark:bg-green-500" : "bg-primary-600";
            const progressTextColor = isCompleted ? "text-green-600 dark:text-green-400" : "text-primary-600 dark:text-primary-400";
            
            return (
            <Link
              key={path.id}
              to={`/learning-paths/${path.id}`}
              className={`group flex flex-col rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border overflow-hidden transform hover:-translate-y-1 ${
                isCompleted 
                  ? "bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-900/30" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {path.description}
                    </p>
                  </div>
                  {path.isActive && (
                    <span className="ml-3 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wide rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="capitalize">{path.difficultyLevel}</span>
                    </div>
                    {path.estimatedDays && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{path.estimatedDays} days</span>
                      </div>
                    )}
                  </div>

                  {path.progress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span>Progress</span>
                        <span className={`${progressTextColor}`}>
                          {path.progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${progressColor} h-full rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${path.progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
