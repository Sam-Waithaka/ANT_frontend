import { ApiError, createApiUrl } from '../../../../services/apiClient';
import type { PublicMemorial } from '../types';

const readDetail = (payload: unknown) => {
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  if (!payload || typeof payload !== 'object') return undefined;

  const detail = (payload as Record<string, unknown>).detail;
  return typeof detail === 'string' && detail.trim() ? detail.trim() : undefined;
};

const parseBody = async (response: Response) => {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const fetchPublicMemorial = async (slug: string, signal?: AbortSignal) => {
  const endpoint = createApiUrl(`/v1/memorials/${encodeURIComponent(slug)}/`);
  const response = await fetch(endpoint, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await parseBody(response);

  if (!response.ok) {
    const detail = readDetail(payload);
    throw new ApiError(detail || 'The memorial could not be loaded.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return payload as PublicMemorial;
};

export const isPublicMemorialUnavailable = (error: unknown) =>
  error instanceof ApiError && error.status === 404;
