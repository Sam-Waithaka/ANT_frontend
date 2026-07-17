import type { AudioVisualItem } from '../types/audioVisual';
import type { PaginatedResponse, PublicWritingCard } from '../types/writing';
import { apiGet } from './apiClient';
import { normalizeAudioVisualItem } from './audioVisualApi';

export type PublicSearchQuery = {
  q?: string;
  search?: string;
  page?: number;
  page_size?: number;
  [key: string]: boolean | number | string | undefined;
};

const emptyPage = <T>(): PaginatedResponse<T> => ({ count: 0, next: null, previous: null, results: [] });

const toQueryString = (query: PublicSearchQuery = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

const normalizePage = <T>(payload: unknown, normalizeItem?: (item: unknown) => T | null): PaginatedResponse<T> => {
  if (!payload || typeof payload !== 'object') return emptyPage<T>();

  const record = payload as Partial<PaginatedResponse<unknown>>;
  const rawResults = Array.isArray(record.results) ? record.results : [];
  const results = normalizeItem ? rawResults.map(normalizeItem).filter(Boolean) as T[] : rawResults as T[];

  return {
    count: typeof record.count === 'number' ? record.count : results.length,
    next: record.next ?? null,
    previous: record.previous ?? null,
    results,
  };
};

export const searchPublicWritings = async (query: PublicSearchQuery, signal?: AbortSignal) => {
  const payload = await apiGet<unknown>(`/v1/search/writings/${toQueryString(query)}`, {
    signal,
    timeoutMs: 12000,
  });

  return normalizePage<PublicWritingCard>(payload);
};

export const searchPublicAudioVisual = async (query: PublicSearchQuery, signal?: AbortSignal) => {
  const payload = await apiGet<unknown>(`/v1/search/audio-visual/${toQueryString(query)}`, {
    signal,
    timeoutMs: 12000,
  });

  return normalizePage<AudioVisualItem>(payload, normalizeAudioVisualItem);
};
