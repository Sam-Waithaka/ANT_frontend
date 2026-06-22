import { ApiError, createApiUrl } from './apiClient';
import type {
  MediaAssetUsage,
  PaginatedResponse,
  Writing,
  WritingAssignment,
  WritingCategory,
  WritingCategorySeriesLink,
  WritingCreatePayload,
  WritingFilters,
  WritingResourceType,
  WritingResourceTypeCategoryLink,
  WritingSeries,
  WritingUpdatePayload,
} from '../types/writing';

type PortalRequestOptions = {
  accessToken: string;
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  signal?: AbortSignal;
};

const emptyPage = <T>(): PaginatedResponse<T> => ({ count: 0, results: [] });

const parseJson = async (response: Response) => {
  if (response.status === 204) return null;
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

const portalRequest = async <T>(path: string, options: PortalRequestOptions): Promise<T> => {
  const endpoint = createApiUrl(path);
  const response = await fetch(endpoint, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${options.accessToken}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    method: options.method ?? 'GET',
    signal: options.signal,
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const detail = readDetail(payload);
    throw new ApiError(detail || 'Writing Studio request failed.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return payload as T;
};

const toQueryString = (filters: WritingFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === 'ALL') return;
    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const normalizePage = <T>(payload: unknown): PaginatedResponse<T> => {
  if (Array.isArray(payload)) return { count: payload.length, results: payload as T[] };
  if (!payload || typeof payload !== 'object') return emptyPage<T>();
  const record = payload as Partial<PaginatedResponse<T>>;
  return {
    count: typeof record.count === 'number' ? record.count : Array.isArray(record.results) ? record.results.length : 0,
    next: record.next ?? null,
    previous: record.previous ?? null,
    results: Array.isArray(record.results) ? record.results : [],
  };
};

export const fetchWritings = async (accessToken: string, filters?: WritingFilters, signal?: AbortSignal) =>
  normalizePage<Writing>(await portalRequest<unknown>(`/v1/writings/${toQueryString(filters)}`, { accessToken, signal }));

export const fetchWriting = (accessToken: string, id: string | number, signal?: AbortSignal) =>
  portalRequest<Writing>(`/v1/writings/${id}/`, { accessToken, signal });

export const createWriting = (accessToken: string, body: WritingCreatePayload) =>
  portalRequest<Writing>('/v1/writings/', { accessToken, body, method: 'POST' });

export const updateWriting = (accessToken: string, id: string | number, body: WritingUpdatePayload) =>
  portalRequest<Writing>(`/v1/writings/${id}/`, { accessToken, body, method: 'PATCH' });

export const publishWriting = (accessToken: string, id: string | number) =>
  portalRequest<Writing>(`/v1/writings/${id}/publish/`, { accessToken, method: 'POST' });

export const archiveWriting = (accessToken: string, id: string | number) =>
  portalRequest<Writing>(`/v1/writings/${id}/archive/`, { accessToken, method: 'POST' });

export const featureWriting = (accessToken: string, id: string | number) =>
  portalRequest<Writing>(`/v1/writings/${id}/feature/`, { accessToken, method: 'POST' });

export const unfeatureWriting = (accessToken: string, id: string | number) =>
  portalRequest<Writing>(`/v1/writings/${id}/unfeature/`, { accessToken, method: 'POST' });

export const fetchResourceTypes = async (accessToken: string, signal?: AbortSignal) =>
  normalizePage<WritingResourceType>(await portalRequest<unknown>('/v1/writing-resource-types/', { accessToken, signal }));

export const fetchResourceTypeCategoryLinks = async (accessToken: string, signal?: AbortSignal) =>
  normalizePage<WritingResourceTypeCategoryLink>(await portalRequest<unknown>('/v1/writing-resource-type-categories/', { accessToken, signal }));

export const fetchCategories = async (accessToken: string, signal?: AbortSignal) =>
  normalizePage<WritingCategory>(await portalRequest<unknown>('/v1/writing-categories/', { accessToken, signal }));

export const fetchSeries = async (accessToken: string, signal?: AbortSignal) =>
  normalizePage<WritingSeries>(await portalRequest<unknown>('/v1/writing-series/', { accessToken, signal }));

export const fetchCategorySeriesLinks = async (accessToken: string, signal?: AbortSignal) =>
  normalizePage<WritingCategorySeriesLink>(await portalRequest<unknown>('/v1/writing-category-series/', { accessToken, signal }));

export const createResourceType = (accessToken: string, body: Partial<WritingResourceType>) =>
  portalRequest<WritingResourceType>('/v1/writing-resource-types/', { accessToken, body, method: 'POST' });

export const createResourceTypeCategoryLink = (accessToken: string, body: Partial<WritingResourceTypeCategoryLink>) =>
  portalRequest<WritingResourceTypeCategoryLink>('/v1/writing-resource-type-categories/', { accessToken, body, method: 'POST' });

export const createCategory = (accessToken: string, body: Partial<WritingCategory>) =>
  portalRequest<WritingCategory>('/v1/writing-categories/', { accessToken, body, method: 'POST' });

export const createSeries = (accessToken: string, body: Partial<WritingSeries>) =>
  portalRequest<WritingSeries>('/v1/writing-series/', { accessToken, body, method: 'POST' });

export const createCategorySeriesLink = (accessToken: string, body: Partial<WritingCategorySeriesLink>) =>
  portalRequest<WritingCategorySeriesLink>('/v1/writing-category-series/', { accessToken, body, method: 'POST' });

export const fetchAssignments = async (accessToken: string, signal?: AbortSignal) =>
  normalizePage<WritingAssignment>(await portalRequest<unknown>('/v1/writing-assignments/', { accessToken, signal }));

export const createAssignment = (accessToken: string, body: Partial<WritingAssignment>) =>
  portalRequest<WritingAssignment>('/v1/writing-assignments/', { accessToken, body, method: 'POST' });

export const updateAssignment = (accessToken: string, id: string | number, body: Partial<WritingAssignment>) =>
  portalRequest<WritingAssignment>(`/v1/writing-assignments/${id}/`, { accessToken, body, method: 'PATCH' });

export const deleteAssignment = (accessToken: string, id: string | number) =>
  portalRequest<null>(`/v1/writing-assignments/${id}/`, { accessToken, method: 'DELETE' });

export const fetchMediaAssetUsage = (accessToken: string, id: string | number, signal?: AbortSignal) =>
  portalRequest<MediaAssetUsage>(`/v1/media-assets/${id}/usage/`, { accessToken, signal });
