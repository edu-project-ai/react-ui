export interface SearchResult {
  file: string;
  line: number;
  column: number;
  text: string;
}

export type GroupedSearchResults = Record<string, SearchResult[]>;
