import { useEffect, useState } from 'react';
import { searchBible } from '../services/scriptureApi';
import type { BibleToolRecord } from '../types/scripture';

export const useScriptureSearch = (searchTerm: string, versionId?: string) => {
  const [results, setResults] = useState<BibleToolRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const normalizedSearchTerm = searchTerm.trim();
  const isSearching = normalizedSearchTerm.length >= 2;

  useEffect(() => {
    if (!isSearching) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const nextResults = await searchBible({
          q: normalizedSearchTerm,
          version: versionId || undefined,
        }, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setResults(nextResults);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setError('We could not search Scripture right now. Confirm the Bible API is running.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isSearching, normalizedSearchTerm, versionId]);

  return {
    error,
    isSearching,
    loading,
    normalizedSearchTerm,
    results,
  };
};
