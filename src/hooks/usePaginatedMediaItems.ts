import { useCallback, useEffect, useRef, useState } from 'react';
import { hasMoreMediaItems, mergeUniqueMediaItems } from '../components/media/mediaPagination';
import { fetchAudioVisualItemPage } from '../services/audioVisualApi';
import type { AudioVisualItem, AudioVisualListQuery } from '../types/audioVisual';

type PaginationStatus = 'error' | 'loading' | 'loading-more' | 'ready';

type PaginationState = {
  count: number;
  error: string;
  items: AudioVisualItem[];
  key: string;
  next: string | null;
  page: number;
  status: PaginationStatus;
};

const initialState = (key: string): PaginationState => ({
  count: 0,
  error: '',
  items: [],
  key,
  next: null,
  page: 0,
  status: 'loading',
});

export const usePaginatedMediaItems = (
  query: AudioVisualListQuery,
  { pageSize = 20 }: { pageSize?: number } = {},
) => {
  const key = JSON.stringify(query);
  const [state, setState] = useState<PaginationState>(() => initialState(key));
  const loadMoreController = useRef<AbortController | null>(null);
  const currentState = state.key === key ? state : initialState(key);

  useEffect(() => {
    const controller = new AbortController();

    fetchAudioVisualItemPage({ ...query, page: 1, pageSize }, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setState({
          count: page.count,
          error: '',
          items: page.items,
          key,
          next: page.next,
          page: 1,
          status: 'ready',
        });
      })
      .catch((error) => {
        if (controller.signal.aborted || error instanceof DOMException && error.name === 'AbortError') return;
        setState({ ...initialState(key), error: 'Unable to load this media collection right now.', status: 'error' });
      });

    return () => controller.abort();
  }, [key, pageSize, query]);

  useEffect(() => () => loadMoreController.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (
      currentState.status === 'loading'
      || currentState.status === 'loading-more'
      || !hasMoreMediaItems(currentState)
    ) return;

    const controller = new AbortController();
    loadMoreController.current?.abort();
    loadMoreController.current = controller;
    const nextPage = currentState.page + 1;

    setState((existing) => existing.key === key
      ? { ...existing, error: '', status: 'loading-more' }
      : existing);

    try {
      const page = await fetchAudioVisualItemPage({ ...query, page: nextPage, pageSize }, controller.signal);
      if (controller.signal.aborted) return;

      setState((existing) => existing.key === key ? {
        ...existing,
        count: page.count,
        error: '',
        items: mergeUniqueMediaItems(existing.items, page.items),
        next: page.next,
        page: nextPage,
        status: 'ready',
      } : existing);
    } catch (error) {
      if (controller.signal.aborted || error instanceof DOMException && error.name === 'AbortError') return;
      setState((existing) => existing.key === key
        ? { ...existing, error: 'Unable to load more videos. Please try again.', status: 'ready' }
        : existing);
    }
  }, [currentState, key, pageSize, query]);

  return {
    ...currentState,
    canLoadMore: hasMoreMediaItems(currentState),
    loadMore,
    loadingMore: currentState.status === 'loading-more',
  };
};
