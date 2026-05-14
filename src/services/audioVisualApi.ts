import type {
  AudioVisualHomePayload,
  AudioVisualItem,
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

const normalizeLookup = (value: unknown): AudioVisualLookup => {
  const record = readRecord(value);
  const name = readString(record, ['name', 'title', 'label'], 'Media');

  return {
    id: typeof record.id === 'number' || typeof record.id === 'string' ? record.id : undefined,
    name,
    slug: readString(record, ['slug'], name.toLowerCase().replace(/\s+/g, '-')),
  };
};

const normalizeItem = (value: unknown): AudioVisualItem => {
  const record = readRecord(value);
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
    items: readArray(record, ['items', 'results']).map(normalizeItem),
  };
};

const normalizeLiveCta = (value: unknown): AudioVisualLiveCta | null => {
  const record = readRecord(value);
  const item = record.item ? normalizeItem(record.item) : null;

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
    hero: record.hero ? normalizeItem(record.hero) : null,
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
