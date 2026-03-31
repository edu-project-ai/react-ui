import { useState, useMemo, useCallback } from 'react';
import type { SearchResult, GroupedSearchResults } from '../types';
import { useLazySearchFilesQuery } from '../api/ideProxyApi';
import { useIdeStore } from '../store/useIdeStore';
import { useDebouncedCallback } from './useDebouncedCallback';

interface UseSearchReturn {
  query: string;
  matchCase: boolean;
  matchWord: boolean;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  groupedResults: GroupedSearchResults;
  handleInputChange: (value: string) => void;
  setMatchCase: (val: boolean) => void;
  setMatchWord: (val: boolean) => void;
  handleResultClick: (result: SearchResult) => void;
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchWord, setMatchWord] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerId = useIdeStore((s) => s.containerId);
  const openFile = useIdeStore((s) => s.openFile);

  const [triggerSearch] = useLazySearchFilesQuery();

  const performSearch = useCallback(
    async (q: string, caseSensitive: boolean, wholeWord: boolean) => {
      if (!q.trim() || !containerId) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await triggerSearch({ 
          containerId, 
          query: q.trim(),
          matchCase: caseSensitive,
          matchWord: wholeWord,
        }).unwrap();
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
      debouncedSearch(value, matchCase, matchWord);
    },
    [debouncedSearch, matchCase, matchWord],
  );

  const handleMatchCaseChange = useCallback((val: boolean) => {
    setMatchCase(val);
    debouncedSearch(query, val, matchWord);
  }, [query, matchWord, debouncedSearch]);

  const handleMatchWordChange = useCallback((val: boolean) => {
    setMatchWord(val);
    debouncedSearch(query, matchCase, val);
  }, [query, matchCase, debouncedSearch]);

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
    matchCase,
    matchWord,
    results,
    loading,
    error,
    groupedResults,
    handleInputChange,
    setMatchCase: handleMatchCaseChange,
    setMatchWord: handleMatchWordChange,
    handleResultClick,
  };
}
