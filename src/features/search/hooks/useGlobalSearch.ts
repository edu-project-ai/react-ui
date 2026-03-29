import { useMemo, useState, useEffect } from "react";
import { useGetAllLearningPathsQuery } from "@/features/learning-paths";
import { useGetAllResourcesQuery } from "@/features/learning-paths/api/learningPathsApi";
import type {
  GroupedSearchResults,
  PageSearchResult,
  RoadmapSearchResult,
  ResourceSearchResult,
} from "../types/searchTypes";

const DEBOUNCE_MS = 300;
const MAX_RESULTS_PER_CATEGORY = 5;

/**
 * Static navigation pages available in search.
 * Keywords include Ukrainian alternatives for locale-aware matching.
 */
const NAVIGATION_PAGES: PageSearchResult[] = [
  {
    id: "page-dashboard",
    title: "Dashboard",
    category: "page",
    path: "/dashboard",
    keywords: ["дашборд", "головна", "панель"],
    icon: null, // Icons are rendered by the component
  },
  {
    id: "page-learning-paths",
    title: "My Roadmaps",
    category: "page",
    path: "/learning-paths",
    keywords: ["роадмапи", "навчальні шляхи", "roadmaps"],
    icon: null,
  },
  {
    id: "page-progress",
    title: "Progress",
    category: "page",
    path: "/progress",
    keywords: ["прогрес", "статистика", "analytics"],
    icon: null,
  },
  {
    id: "page-resources",
    title: "Resources",
    category: "page",
    path: "/resources",
    keywords: ["ресурси", "матеріали", "documentation"],
    icon: null,
  },
  {
    id: "page-settings",
    title: "Settings",
    category: "page",
    path: "/settings",
    keywords: ["налаштування", "профіль", "profile", "preferences"],
    icon: null,
  },
  {
    id: "page-create-roadmap",
    title: "New Roadmap",
    category: "page",
    path: "/create-roadmap",
    keywords: ["створити", "новий", "create", "new"],
    icon: null,
  },
];

/**
 * Case-insensitive substring match across multiple fields
 */
function matchesQuery(query: string, ...fields: (string | null | undefined)[]): boolean {
  const lowerQuery = query.toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(lowerQuery));
}

/**
 * Global search hook — searches roadmaps, resources, and navigation pages
 * from RTK Query cache with debounce.
 */
export function useGlobalSearch(rawQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the query input
  useEffect(() => {
    if (!rawQuery.trim()) {
      setDebouncedQuery("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [rawQuery]);

  const { data: learningPaths, isLoading: isLoadingPaths } =
    useGetAllLearningPathsQuery();
  const { data: resources, isLoading: isLoadingResources } =
    useGetAllResourcesQuery();

  const isLoading = isLoadingPaths || isLoadingResources;

  const results: GroupedSearchResults = useMemo(() => {
    const empty: GroupedSearchResults = {
      roadmaps: [],
      resources: [],
      pages: [],
    };

    if (!debouncedQuery) return empty;

    // Search roadmaps
    const roadmaps: RoadmapSearchResult[] = (learningPaths ?? [])
      .filter((lp) => matchesQuery(debouncedQuery, lp.title, lp.description, lp.goal))
      .slice(0, MAX_RESULTS_PER_CATEGORY)
      .map((lp) => ({
        id: lp.id,
        title: lp.title,
        category: "roadmap" as const,
        description: lp.description,
        progressPercentage: lp.progressPercentage ?? lp.progress?.percentage,
      }));

    // Search resources
    const filteredResources: ResourceSearchResult[] = (resources ?? [])
      .filter((r) =>
        matchesQuery(debouncedQuery, r.title, r.type, ...(r.tags ?? []))
      )
      .slice(0, MAX_RESULTS_PER_CATEGORY)
      .map((r) => ({
        id: r.id,
        title: r.title,
        category: "resource" as const,
        resourceType: r.type,
        url: r.url,
      }));

    // Search navigation pages
    const pages: PageSearchResult[] = NAVIGATION_PAGES.filter((page) =>
      matchesQuery(debouncedQuery, page.title, ...page.keywords)
    );

    return { roadmaps, resources: filteredResources, pages };
  }, [debouncedQuery, learningPaths, resources]);

  const totalCount =
    results.roadmaps.length + results.resources.length + results.pages.length;

  const hasQuery = debouncedQuery.length > 0;

  return { results, totalCount, isLoading, hasQuery };
}
