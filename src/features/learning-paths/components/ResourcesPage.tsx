import { memo, useState, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useGetAllResourcesQuery } from "../api/learningPathsApi";
import { Spinner } from "@/components/ui/spinner";
import type { ResourceItem } from "../services/type";

const TYPE_ICONS: Record<string, ReactNode> = {
  article: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  video: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  documentation: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

interface ResourceCardProps {
  resource: ResourceItem;
}

const ResourceCard = memo(({ resource }: ResourceCardProps) => {
  const typeKey = resource.type?.toLowerCase();
  const icon = TYPE_ICONS[typeKey] ?? DEFAULT_ICON;

  return (
    <Link
      to={`/resources/${resource.id}`}
      className="group bg-card rounded-xl border border-border p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        {resource.type && (
          <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
            {resource.type}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {resource.title}
        </h3>
        {resource.content && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {resource.content}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {resource.language && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {resource.language}
          </span>
        )}
        {resource.difficultyLevel && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {resource.difficultyLevel}
          </span>
        )}
        {resource.estimatedReadTime != null && (
          <span className="text-xs text-muted-foreground ml-auto">
            {resource.estimatedReadTime} min
          </span>
        )}
      </div>

      {resource.url && (
        <div className="flex items-center gap-1 text-xs text-primary/70 group-hover:text-primary transition-colors">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="truncate">{resource.url}</span>
        </div>
      )}
    </Link>
  );
});
ResourceCard.displayName = "ResourceCard";

const EmptyState = memo(() => (
  <div className="col-span-full bg-muted/30 rounded-xl p-12 text-center border border-dashed border-border">
    <svg className="w-10 h-10 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
    <p className="text-muted-foreground text-sm">No resources found.</p>
  </div>
));
EmptyState.displayName = "EmptyState";

export const ResourcesPage = () => {
  const { data: resources, isLoading, error } = useGetAllResourcesQuery();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("all");

  const types = useMemo(() => {
    if (!resources) return [];
    const set = new Set(resources.map((r) => r.type?.toLowerCase()).filter(Boolean));
    return Array.from(set) as string[];
  }, [resources]);

  const filtered = useMemo(() => {
    if (!resources) return [];
    return resources.filter((r) => {
      const matchType = activeType === "all" || r.type?.toLowerCase() === activeType;
      const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [resources, activeType, search]);

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
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">Failed to load resources. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
          Resources
        </h1>
        <p className="text-muted-foreground">
          All learning materials linked to your roadmaps.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* Type tabs */}
        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveType("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({resources?.length ?? 0})
            </button>
            {types.map((type) => {
              const count = resources?.filter((r) => r.type?.toLowerCase() === type).length ?? 0;
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors ${
                    activeType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.length > 0
          ? filtered.map((r) => <ResourceCard key={r.id} resource={r} />)
          : <EmptyState />}
      </div>
    </div>
  );
};
