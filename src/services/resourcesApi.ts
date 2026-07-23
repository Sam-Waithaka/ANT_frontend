import { ApiError, createApiUrl } from './apiClient';
import type { PublicResourceTypeDetail, PublicWritingCard, PublicWritingDetail, ResourcesHome, ResourcesNavigation, ResourcesNavigationFilters } from '../types/writing';

const emptyNavigation: ResourcesNavigation = {
  categories: [],
  category_series_links: [],
  ministries: [],
  resource_type_category_links: [],
  resource_types: [],
  scripture_books: [],
  series: [],
};

const emptyHome: ResourcesHome = {
  category_rails: [],
  featured_articles: [],
  featured_categories: [],
  featured_series: [],
  hero_featured: null,
  latest_articles: [],
  ministries: [],
  resource_type_rails: [],
  resource_types: [],
  scripture_books: [],
  series_rails: [],
};

const emptyResourceTypeDetail: PublicResourceTypeDetail = {
  articles: { count: 0, next: null, previous: null, results: [] },
  categories: [],
  category_rails: [],
  featured_articles: [],
  latest_articles: [],
  resource_type: {
    description: '',
    id: '',
    is_active: false,
    is_featured: false,
    name: '',
    slug: '',
    sort_order: 0,
    writing_count: 0,
  },
  series: [],
  series_rails: [],
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

const readArray = <T>(record: Record<string, unknown>, key: string) =>
  Array.isArray(record[key]) ? record[key] as T[] : [];

const normalizePublicWritingCardPage = (payload: unknown): PublicResourceTypeDetail['articles'] => {
  if (!payload || typeof payload !== 'object') return emptyResourceTypeDetail.articles;
  const record = payload as Record<string, unknown>;
  const results = readArray<PublicWritingCard>(record, 'results');

  return {
    count: typeof record.count === 'number' ? record.count : results.length,
    next: typeof record.next === 'string' ? record.next : null,
    previous: typeof record.previous === 'string' ? record.previous : null,
    results,
  };
};

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

export const normalizeResourcesHome = (payload: unknown): ResourcesHome => {
  if (!payload || typeof payload !== 'object') return emptyHome;
  const record = payload as Record<string, unknown>;

  return {
    category_rails: readArray(record, 'category_rails'),
    featured_articles: readArray(record, 'featured_articles'),
    featured_categories: readArray(record, 'featured_categories'),
    featured_series: readArray(record, 'featured_series'),
    hero_featured: record.hero_featured && typeof record.hero_featured === 'object' ? record.hero_featured as ResourcesHome['hero_featured'] : null,
    latest_articles: readArray(record, 'latest_articles'),
    ministries: readArray(record, 'ministries'),
    resource_type_rails: readArray(record, 'resource_type_rails'),
    resource_types: readArray(record, 'resource_types'),
    scripture_books: readArray(record, 'scripture_books'),
    series_rails: readArray(record, 'series_rails'),
  };
};

export const normalizeResourceTypeDetail = (payload: unknown): PublicResourceTypeDetail => {
  if (!payload || typeof payload !== 'object') return emptyResourceTypeDetail;
  const record = payload as Record<string, unknown>;

  return {
    articles: normalizePublicWritingCardPage(record.articles),
    categories: readArray(record, 'categories'),
    category_rails: readArray(record, 'category_rails'),
    featured_articles: readArray(record, 'featured_articles'),
    latest_articles: readArray(record, 'latest_articles'),
    resource_type: record.resource_type && typeof record.resource_type === 'object'
      ? record.resource_type as PublicResourceTypeDetail['resource_type']
      : emptyResourceTypeDetail.resource_type,
    series: readArray(record, 'series'),
    series_rails: readArray(record, 'series_rails'),
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


export const fetchResourcesHome = async (signal?: AbortSignal) => {
  const endpoint = createApiUrl('/v1/resources/home/');
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const detail = readDetail(payload);
    throw new ApiError(detail || 'Resources home request failed.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return normalizeResourcesHome(payload);
};

export const fetchResourceTypeDetail = async (
  slug: string,
  { page = 1, pageSize = 24 }: { page?: number; pageSize?: number } = {},
  signal?: AbortSignal,
) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('page_size', String(pageSize));

  const endpoint = createApiUrl(`/v1/resources/type/${encodeURIComponent(slug)}/?${params.toString()}`);
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const detail = readDetail(payload);
    throw new ApiError(detail || 'Resource type detail request failed.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return normalizeResourceTypeDetail(payload);
};

export const fetchPublicResourceDetail = async (slug: string, publishedAt?: string, signal?: AbortSignal) => {
  const params = new URLSearchParams();
  if (publishedAt) params.set('published_at', publishedAt);
  const query = params.toString();
  const endpoint = createApiUrl(`/v1/resources/${encodeURIComponent(slug)}/${query ? `?${query}` : ''}`);
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const detail = readDetail(payload);
    throw new ApiError(detail || 'Resource detail request failed.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return payload as PublicWritingDetail;
};



