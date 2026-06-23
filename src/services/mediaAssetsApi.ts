import { ApiError, createApiUrl } from './apiClient';
import type { PaginatedResponse, WritingMediaAsset } from '../types/writing';

export type MediaAssetStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type MediaVariantFormat = 'avif' | 'webp' | 'jpeg';
export type MediaVariantSize = 'thumb' | 'small' | 'medium' | 'large';

export type MediaVariant = {
  file_size: number | null;
  format: MediaVariantFormat;
  generated_at: string | null;
  height: number;
  id: number;
  quality: number | null;
  size_name: MediaVariantSize;
  status: MediaAssetStatus;
  url: string | null;
  width: number;
};

export type MediaVariantMap = Partial<Record<MediaVariantFormat, Partial<Record<MediaVariantSize, MediaVariant>>>>;

export type MediaAsset = WritingMediaAsset & {
  caption: string;
  height: number | null;
  original_url: string | null;
  status: MediaAssetStatus;
  uuid: string;
  variant_map: MediaVariantMap;
  variants: MediaVariant[];
  width: number | null;
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

export const fetchMediaAsset = (accessToken: string, id: number | string, signal?: AbortSignal) =>
  mediaRequest<MediaAsset>(`/v1/media-assets/${id}/`, accessToken, { signal });

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

const mediaVariantSizes: MediaVariantSize[] = ['thumb', 'small', 'medium', 'large'];

export const readyMediaVariants = (asset: MediaAsset | null | undefined, format: MediaVariantFormat) => {
  if (!asset || asset.status !== 'ready') return [];

  return mediaVariantSizes
    .map((size) => asset.variant_map[format]?.[size])
    .filter((variant): variant is MediaVariant => Boolean(variant?.url && variant.status === 'ready'));
};

export const mediaAssetImageUrl = (asset?: MediaAsset | null) => {
  if (!asset || asset.status !== 'ready') return '';
  const preferredVariant = readyMediaVariants(asset, 'webp').find((variant) => variant.size_name === 'medium')
    || readyMediaVariants(asset, 'webp')[0]
    || readyMediaVariants(asset, 'jpeg').find((variant) => variant.size_name === 'medium')
    || readyMediaVariants(asset, 'jpeg')[0]
    || readyMediaVariants(asset, 'avif').find((variant) => variant.size_name === 'medium')
    || readyMediaVariants(asset, 'avif')[0];
  return preferredVariant?.url || asset.original_url || '';
};

