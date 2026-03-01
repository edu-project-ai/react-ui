import { useState, useMemo, useCallback } from 'react';
import type { SearchResult, GroupedSearchResults } from '../types';
import { useLazySearchFilesQuery } from '../api/ideProxyApi';
import { useIdeStore } from '../store/useIdeStore';
import { useDebouncedCallback } from './useDebouncedCallback';

interface UseSearchReturn {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  groupedResults: GroupedSearchResults;
  handleInputChange: (value: string) => void;
  handleResultClick: (result: SearchResult) => void;
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerId = useIdeStore((s) => s.containerId);
  const openFile = useIdeStore((s) => s.openFile);

  const [triggerSearch] = useLazySearchFilesQuery();

  const performSearch = useCallback(
    async (q: string) => {
      if (!q.trim() || !containerId) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await triggerSearch({ containerId, query: q.trim() }).unwrap();
        setResults(res);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to search files');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [containerId, triggerSearch],
  );

  const debouncedSearch = useDebouncedCallback(performSearch, 300);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      openFile(result.file);
    },
    [openFile],
  );

  const groupedResults = useMemo(() => {
    const groups: GroupedSearchResults = {};
    results.forEach((r) => {
      if (!groups[r.file]) groups[r.file] = [];
      groups[r.file].push(r);
    });
    return groups;
  }, [results]);

  return {
    query,
    results,
    loading,
    error,
    groupedResults,
    handleInputChange,
    handleResultClick,
  };
}
