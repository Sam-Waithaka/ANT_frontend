import { useEffect, useMemo, useRef, useState } from 'react';
import { searchBible } from '../services/scriptureApi';
import type { BibleSearchResult } from '../types/scripture';

const SEARCH_DEBOUNCE_MS = 350;
const SEARCH_PAGE_SIZE = 25;

export const useScriptureSearch = (searchTerm: string, versionId?: string) => {
  const [results, setResults] = useState<BibleSearchResult[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchConfig, setSearchConfig] = useState<Record<string, unknown> | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const pageRef = useRef(1);
  const requestControllerRef = useRef<AbortController | null>(null);
  const normalizedSearchTerm = searchTerm.trim();
  const isSearching = normalizedSearchTerm.length >= 2;
  const hasMore = Boolean(next);
  const hasFuzzyResults = useMemo(
    () => results.some((result) => result.searchType === 'fuzzy' || result.exactMatch === false || Boolean(result.similarity)),
    [results],
  );

  useEffect(() => {
    requestControllerRef.current?.abort();

    if (!isSearching) {
      setResults([]);
      setCount(0);
      setNext(null);
      setSuggestions([]);
      setSearchConfig(undefined);
      setError('');
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;
    const timeout = window.setTimeout(async () => {
      pageRef.current = 1;
      setLoading(true);
      setError('');

      try {
        const response = await searchBible({
          page_size: SEARCH_PAGE_SIZE,
          q: normalizedSearchTerm,
          version: versionId || undefined,
        }, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setResults(response.results);
          setCount(response.count);
          setNext(response.next);
          setSuggestions(response.suggestions);
          setSearchConfig(response.searchConfig);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setCount(0);
          setNext(null);
          setSuggestions([]);
          setSearchConfig(undefined);
          setError('We could not search Scripture right now. Confirm the Bible API is running.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isSearching, normalizedSearchTerm, versionId]);

  const loadMore = async () => {
    if (!isSearching || loading || loadingMore || !next) {
      return;
    }

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const nextPage = pageRef.current + 1;
    setLoadingMore(true);
    setError('');

    try {
      const response = await searchBible({
        page: nextPage,
        page_size: SEARCH_PAGE_SIZE,
        q: normalizedSearchTerm,
        version: versionId || undefined,
      }, {
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        pageRef.current = nextPage;
        setResults((current) => [...current, ...response.results]);
        setCount(response.count);
        setNext(response.next);
        setSuggestions(response.suggestions);
        setSearchConfig(response.searchConfig);
      }
    } catch {
      if (!controller.signal.aborted) {
        setError('We could not load more search results right now.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoadingMore(false);
      }
    }
  };

  return {
    count,
    error,
    hasFuzzyResults,
    hasMore,
    isSearching,
    loadMore,
    loading,
    loadingMore,
    normalizedSearchTerm,
    searchConfig,
    suggestions,
    results,
  };
};
