import { memo } from "react";
import { Link } from "react-router-dom";
import { useGetAllLearningPathsQuery } from "../api/learningPathsApi";
import { Spinner } from "@/components/ui/spinner";
import type { LearningPath } from "../services/type";
import { LearningPathCard } from "./LearningPathCard";

const PlusIcon = memo(() => (
  <svg
    className="-ml-1 mr-3 h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
));
PlusIcon.displayName = "PlusIcon";

const HeroSection = memo(() => (
  <div className="mb-12 text-center max-w-3xl mx-auto">
    <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
      Your Learning Journey
    </h1>
    <p className="text-xl text-muted-foreground mb-8">
      Master new skills with structured roadmaps tailored to your goals.
    </p>
    <Link
      to="/create-roadmap"
      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
    >
      <PlusIcon />
      Create New Roadmap
    </Link>
  </div>
));
HeroSection.displayName = "HeroSection";

const EmptyState = memo(() => (
  <div className="bg-muted rounded-lg p-8 text-center">
    <p className="text-muted-foreground mb-4">
      You don't have any learning paths yet.
    </p>
    <Link
      to="/dashboard"
      className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors"
    >
      Go to Dashboard
    </Link>
  </div>
));
EmptyState.displayName = "EmptyState";

const LoadingState = memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
  </div>
));
LoadingState.displayName = "LoadingState";

const ErrorState = memo(() => (
  <div className="container mx-auto px-4 py-8">
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
      <p className="text-destructive">
        Failed to load learning paths. Please try again later.
      </p>
    </div>
  </div>
));
ErrorState.displayName = "ErrorState";

interface LearningPathsGridProps {
  paths: LearningPath[];
}

const LearningPathsGrid = memo(({ paths }: LearningPathsGridProps) => (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {paths.map((path) => (
      <LearningPathCard key={path.id} path={path} />
    ))}
  </div>
));
LearningPathsGrid.displayName = "LearningPathsGrid";

export const LearningPathsPage = () => {
  const {
    data: learningPaths,
    isLoading,
    error,
  } = useGetAllLearningPathsQuery();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  const hasLearningPaths = learningPaths && learningPaths.length > 0;
  const activePaths = learningPaths?.filter((p) => p.isActive !== false) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      {hasLearningPaths ? (
        <LearningPathsGrid paths={activePaths} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
};
