import { ApiError, createApiUrl } from './apiClient';
import type { ResourcesNavigation, ResourcesNavigationFilters } from '../types/writing';

const emptyNavigation: ResourcesNavigation = {
  categories: [],
  category_series_links: [],
  ministries: [],
  resource_type_category_links: [],
  resource_types: [],
  scripture_books: [],
  series: [],
};

const parseJson = async (response: Response) => {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const readDetail = (payload: unknown) => {
  if (typeof payload === 'string') return payload;
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const detail = record.detail || record.message || record.error;
  return typeof detail === 'string' ? detail : undefined;
};

const toQueryString = (filters: ResourcesNavigationFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

const readArray = <T>(record: Record<string, unknown>, key: keyof ResourcesNavigation) =>
  Array.isArray(record[key]) ? record[key] as T[] : [];

export const normalizeResourcesNavigation = (payload: unknown): ResourcesNavigation => {
  if (!payload || typeof payload !== 'object') return emptyNavigation;
  const record = payload as Record<string, unknown>;

  return {
    categories: readArray(record, 'categories'),
    category_series_links: readArray(record, 'category_series_links'),
    ministries: readArray(record, 'ministries'),
    resource_type_category_links: readArray(record, 'resource_type_category_links'),
    resource_types: readArray(record, 'resource_types'),
    scripture_books: readArray(record, 'scripture_books'),
    series: readArray(record, 'series'),
  };
};

export const fetchResourcesNavigation = async (
  filters: ResourcesNavigationFilters = {},
  signal?: AbortSignal,
) => {
  const endpoint = createApiUrl(`/v1/resources/navigation/${toQueryString(filters)}`);
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const detail = readDetail(payload);
    throw new ApiError(detail || 'Resources navigation request failed.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return normalizeResourcesNavigation(payload);
};
