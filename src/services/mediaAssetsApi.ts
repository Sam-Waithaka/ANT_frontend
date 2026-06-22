import { ApiError, createApiUrl } from './apiClient';
import type { PaginatedResponse, WritingMediaAsset } from '../types/writing';

export type MediaAsset = WritingMediaAsset & {
  caption?: string;
  original_url?: string;
  status?: string;
  uuid?: string;
  variant_map?: Record<string, Record<string, { height?: number; url: string; width?: number }>>;
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

const mediaRequest = async <T>(path: string, accessToken: string, init: RequestInit = {}) => {
  const endpoint = createApiUrl(path);
  const response = await fetch(endpoint, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      ...(init.headers || {}),
    },
  });
  const payload = await parseJson(response);

  if (!response.ok) {
    const detail = readDetail(payload);
    throw new ApiError(detail || 'Media request failed.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return payload as T;
};

export const normalizeMediaAssetPage = (payload: unknown): PaginatedResponse<MediaAsset> => {
  if (Array.isArray(payload)) return { count: payload.length, results: payload as MediaAsset[] };
  if (!payload || typeof payload !== 'object') return { count: 0, results: [] };

  const record = payload as Partial<PaginatedResponse<MediaAsset>>;
  return {
    count: typeof record.count === 'number' ? record.count : Array.isArray(record.results) ? record.results.length : 0,
    next: record.next ?? null,
    previous: record.previous ?? null,
    results: Array.isArray(record.results) ? record.results : [],
  };
};

export const fetchMediaAssets = async (accessToken: string, signal?: AbortSignal) =>
  normalizeMediaAssetPage(await mediaRequest<unknown>('/v1/media-assets/', accessToken, { signal }));

export const uploadMediaAsset = async (
  accessToken: string,
  file: File,
  metadata: { altText?: string; caption?: string; title?: string } = {},
) => {
  const body = new FormData();
  body.append('original_file', file);
  body.append('title', metadata.title || file.name);
  body.append('alt_text', metadata.altText || '');
  body.append('caption', metadata.caption || '');

  return mediaRequest<MediaAsset>('/v1/media-assets/', accessToken, {
    body,
    method: 'POST',
  });
};

export const mediaAssetImageUrl = (asset?: MediaAsset | null) => {
  if (!asset) return '';
  const webp = asset.variant_map?.webp;
  const preferredVariant = webp?.medium || webp?.small || Object.values(webp || {})[0];
  return preferredVariant?.url || asset.original_url || asset.url || asset.image || asset.file || '';
};