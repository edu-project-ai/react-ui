import type React from "react";

/**
 * Search result category discriminator
 */
export type SearchResultCategory = "roadmap" | "resource" | "page";

/**
 * Base interface shared by all search result types
 */
interface BaseSearchResult {
  id: string;
  title: string;
  category: SearchResultCategory;
}

/**
 * Roadmap (Learning Path) search result
 */
export interface RoadmapSearchResult extends BaseSearchResult {
  category: "roadmap";
  description: string | null;
  progressPercentage?: number;
}

/**
 * Resource search result
 */
export interface ResourceSearchResult extends BaseSearchResult {
  category: "resource";
  resourceType: string;
  url: string | null;
}

/**
 * Static navigation page search result
 */
export interface PageSearchResult extends BaseSearchResult {
  category: "page";
  path: string;
  icon: React.ReactNode;
  /** Additional keywords for matching (e.g., Ukrainian translations) */
  keywords: string[];
}

/**
 * Discriminated union of all search result types
 */
export type SearchResult =
  | RoadmapSearchResult
  | ResourceSearchResult
  | PageSearchResult;

/**
 * Grouped search results returned by the hook
 */
export interface GroupedSearchResults {
  roadmaps: RoadmapSearchResult[];
  resources: ResourceSearchResult[];
  pages: PageSearchResult[];
}
