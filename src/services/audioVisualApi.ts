import type {
  AudioVisualHomePayload,
  AudioVisualGroupDetail,
  AudioVisualItem,
  AudioVisualListQuery,
  AudioVisualLiveCta,
  AudioVisualLookup,
  AudioVisualRail,
} from '../types/audioVisual';
import { apiGet } from './apiClient';

const readRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const readString = (record: Record<string, unknown>, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
};

const readNumber = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return undefined;
};

const readArray = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const normalizeItemList = (payload: unknown) => {
  const record = readRecord(payload);
  const source = Array.isArray(payload) ? payload : readArray(record, ['results', 'items']);

  return source.map(normalizeAudioVisualItem).filter(Boolean) as AudioVisualItem[];
};

const normalizeLookup = (value: unknown): AudioVisualLookup => {
  const record = readRecord(value);
  const name = readString(record, ['name', 'title', 'label'], 'Media');

  return {
    description: readString(record, ['description']),
    id: typeof record.id === 'number' || typeof record.id === 'string' ? record.id : undefined,
    itemCount: readNumber(record, ['item_count', 'itemCount', 'items_count', 'itemsCount', 'count']),
    name,
    slug: readString(record, ['slug'], name.toLowerCase().replace(/\s+/g, '-')),
    thumbnailUrl: readString(record, ['thumbnail_url', 'thumbnailUrl', 'cover_image', 'coverImage']),
  };
};

export const normalizeAudioVisualItem = (value: unknown): AudioVisualItem | null => {
  const record = readRecord(value);
  if (Object.keys(record).length === 0) {
    return null;
  }

  const mediaTypeRecord = readRecord(record.media_type_detail || record.mediaTypeDetail);
  const mediaType = readString(record, ['media_type', 'mediaType'], 'sermon');
  const title = readString(record, ['title'], 'Untitled message');
  const seriesValue = record.series ? normalizeLookup(record.series) : null;

  return {
    id: typeof record.id === 'number' || typeof record.id === 'string' ? record.id : undefined,
    title,
    slug: readString(record, ['slug'], title.toLowerCase().replace(/\s+/g, '-')),
    description: readString(record, ['description'], ''),
    descriptionExcerpt: readString(record, ['description_excerpt', 'descriptionExcerpt'], readString(record, ['description'], '')),
    thumbnailUrl: readString(record, ['thumbnail_url', 'thumbnailUrl']),
    mediaType,
    mediaTypeLabel: readString(mediaTypeRecord, ['name', 'label'], mediaType),
    language: readString(record, ['language']),
    provider: readString(record, ['provider']),
    durationSeconds: readNumber(record, ['duration_seconds', 'durationSeconds']),
    publishedAt: readString(record, ['published_at', 'publishedAt']),
    speaker: readString(record, ['speaker']),
    scriptureReference: readString(record, ['scripture_reference', 'scriptureReference']),
    externalUrl: readString(record, ['external_url', 'externalUrl']),
    embedUrl: readString(record, ['embed_url', 'embedUrl']),
    liveStatus: readString(record, ['live_status', 'liveStatus']),
    series: seriesValue,
    categories: readArray(record, ['categories']).map(normalizeLookup),
    collections: readArray(record, ['collections']).map(normalizeLookup),
  };
};

const normalizeRail = (value: unknown): AudioVisualRail => {
  const record = readRecord(value);
  const key = readString(record, ['key'], 'media');

  return {
    key,
    title: readString(record, ['title'], key),
    items: readArray(record, ['items', 'results']).map(normalizeAudioVisualItem).filter(Boolean) as AudioVisualItem[],
  };
};

const normalizeGroupDetail = (value: unknown): AudioVisualGroupDetail => {
  const record = readRecord(value);
  const lookup = normalizeLookup(record);

  return {
    ...lookup,
    description: readString(record, ['description']),
    items: readArray(record, ['items', 'results']).map(normalizeAudioVisualItem).filter(Boolean) as AudioVisualItem[],
  };
};

const normalizeLiveCta = (value: unknown): AudioVisualLiveCta | null => {
  const record = readRecord(value);
  const item = record.item ? normalizeAudioVisualItem(record.item) : null;

  if (!item) {
    return null;
  }

  return {
    ctaLabel: readString(record, ['cta_label', 'ctaLabel'], 'Watch live'),
    item,
  };
};

export const normalizeAudioVisualHome = (payload: unknown): AudioVisualHomePayload => {
  const record = readRecord(payload);

  return {
    generatedAt: readString(record, ['generated_at', 'generatedAt']),
    hero: record.hero ? normalizeAudioVisualItem(record.hero) : null,
    live: normalizeLiveCta(record.live),
    rails: readArray(record, ['rails']).map(normalizeRail),
  };
};

export const fetchAudioVisualHome = async (signal?: AbortSignal) => {
  const payload = await apiGet<unknown>('/v1/audio-visual/home/', {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  return normalizeAudioVisualHome(payload);
};

const createQueryString = (query: AudioVisualListQuery = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    const apiKey = key === 'liveStatus' ? 'live_status' : key;
    params.set(apiKey, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchAudioVisualItems = async (query: AudioVisualListQuery = {}, signal?: AbortSignal) => {
  const payload = await apiGet<unknown>(`/v1/audio-visual/${createQueryString(query)}`, {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  return normalizeItemList(payload);
};

export const fetchAudioVisualRails = async (signal?: AbortSignal) => {
  const payload = await apiGet<unknown>('/v1/audio-visual/rails/', {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  const record = readRecord(payload);
  const source = Array.isArray(payload) ? payload : readArray(record, ['rails', 'results', 'items']);
  return source.map(normalizeRail);
};

export const fetchFeaturedAudioVisualItems = async (signal?: AbortSignal) => {
  const payload = await apiGet<unknown>('/v1/audio-visual/featured/', {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  return normalizeItemList(payload);
};

export const fetchLatestAudioVisualItems = async (signal?: AbortSignal) => {
  const payload = await apiGet<unknown>('/v1/audio-visual/latest/', {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  return normalizeItemList(payload);
};

export const fetchLatestSermon = async (signal?: AbortSignal) => {
  const payload = await apiGet<unknown>('/v1/audio-visual/latest-sermon/', {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  return normalizeAudioVisualItem(payload);
};

export const fetchAudioVisualWatchItem = async (slug: string, signal?: AbortSignal) => {
  const payload = await apiGet<unknown>(`/v1/audio-visual/watch/${encodeURIComponent(slug)}/`, {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  return normalizeAudioVisualItem(payload);
};

export const fetchLiveAudioVisualCta = async (signal?: AbortSignal) => {
  const payload = await apiGet<unknown>('/v1/audio-visual/live/', {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  const item = normalizeAudioVisualItem(payload);
  return item ? { ctaLabel: 'Watch live', item } : null;
};

const fetchLookupList = async (path: string, signal?: AbortSignal) => {
  const payload = await apiGet<unknown>(path, {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });
  const record = readRecord(payload);
  const source = Array.isArray(payload) ? payload : readArray(record, ['results', 'items']);

  return source.map(normalizeLookup);
};

export const fetchAudioVisualMediaTypes = (signal?: AbortSignal) =>
  fetchLookupList('/v1/audio-visual/media-types/', signal);

export const fetchAudioVisualLanguages = (signal?: AbortSignal) =>
  fetchLookupList('/v1/audio-visual/languages/', signal);

export const fetchAudioVisualCategories = (signal?: AbortSignal) =>
  fetchLookupList('/v1/audio-visual/categories/', signal);

export const fetchAudioVisualSeries = (signal?: AbortSignal) =>
  fetchLookupList('/v1/audio-visual/series/', signal);

export const fetchAudioVisualSeriesDetail = async (slug: string, signal?: AbortSignal) => {
  const payload = await apiGet<unknown>(`/v1/audio-visual/series/${encodeURIComponent(slug)}/`, {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  return normalizeGroupDetail(payload);
};

export const fetchAudioVisualCollections = (signal?: AbortSignal) =>
  fetchLookupList('/v1/audio-visual/collections/', signal);

export const fetchAudioVisualCollectionDetail = async (slug: string, signal?: AbortSignal) => {
  const payload = await apiGet<unknown>(`/v1/audio-visual/collections/${encodeURIComponent(slug)}/`, {
    cache: 'memory',
    signal,
    timeoutMs: 12000,
  });

  return normalizeGroupDetail(payload);
};
