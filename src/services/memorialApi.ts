import { ApiError, createApiUrl } from './apiClient';
import { authenticatedFetch } from './authSession';
import type {
  MemorialArrangement,
  MemorialArrangementCreatePayload,
  MemorialArrangementUpdatePayload,
  MemorialEditorState,
  MemorialGalleryItem,
  MemorialGalleryItemCreatePayload,
  MemorialGalleryItemUpdatePayload,
  MemorialListFilters,
  MemorialMinistryTribute,
  MemorialMinistryTributeCreatePayload,
  MemorialMinistryTributeUpdatePayload,
  MemorialPage,
  MemorialPageCreatePayload,
  MemorialPageUpdatePayload,
  MemorialPersonalTribute,
  MemorialPersonalTributeCreatePayload,
  MemorialPersonalTributeUpdatePayload,
  MemorialRecordingSection,
  MemorialRecordingSectionCreatePayload,
  MemorialRecordingSectionUpdatePayload,
  MemorialRichTextBlock,
  MemorialRichTextBlockCreatePayload,
  MemorialRichTextBlockUpdatePayload,
  MemorialRichTextMediaEmbed,
  MemorialRichTextMediaEmbedPayload,
  MemorialRichTextScriptureReference,
  MemorialRichTextScriptureReferencePayload,
  MemorialRichTextSectionKey,
  MemorialTimelineEvent,
  MemorialTimelineEventCreatePayload,
  MemorialTimelineEventUpdatePayload,
  MemorialWorkflowAction,
} from '../types/memorial';
import { MEMORIAL_RICH_TEXT_SECTION_KEYS } from '../types/memorial';
import type { PaginatedResponse } from '../types/writing';

type MemorialRequestOptions = {
  accessToken: string;
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  signal?: AbortSignal;
};

export type MemorialResource =
  | 'arrangements'
  | 'gallery-items'
  | 'ministry-tributes'
  | 'pages'
  | 'personal-tributes'
  | 'recording-sections'
  | 'rich-text-blocks'
  | 'rich-text-media-embeds'
  | 'rich-text-scripture-references'
  | 'timeline-events';

export type MemorialWorkflowResource = Exclude<
  MemorialResource,
  'rich-text-media-embeds' | 'rich-text-scripture-references'
>;

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

const memorialRequest = async <T>(
  path: string,
  options: MemorialRequestOptions,
): Promise<T> => {
  const endpoint = createApiUrl(path);
  const response = await authenticatedFetch(endpoint, options.accessToken, {
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
    throw new ApiError(detail || 'Memorial request failed.', {
      detail,
      endpoint,
      status: response.status,
    });
  }

  return payload as T;
};

export const normalizeMemorialPage = <T>(payload: unknown): PaginatedResponse<T> => {
  if (Array.isArray(payload)) return { count: payload.length, results: payload as T[] };
  if (!payload || typeof payload !== 'object') return emptyPage<T>();

  const record = payload as Partial<PaginatedResponse<T>>;
  const results = Array.isArray(record.results) ? record.results : [];

  return {
    count: typeof record.count === 'number' ? record.count : results.length,
    next: record.next ?? null,
    previous: record.previous ?? null,
    results,
  };
};

const readList = <T>(payload: unknown): T[] => normalizeMemorialPage<T>(payload).results;

const readRecordList = <T>(record: Record<string, unknown>, key: string): T[] =>
  readList<T>(record[key]);

const isSectionKey = (value: unknown): value is MemorialRichTextSectionKey =>
  typeof value === 'string'
  && MEMORIAL_RICH_TEXT_SECTION_KEYS.includes(
    value as MemorialRichTextSectionKey,
  );

const readSectionKeys = (value: unknown): MemorialRichTextSectionKey[] => {
  if (!Array.isArray(value)) return [...MEMORIAL_RICH_TEXT_SECTION_KEYS];
  const keys = value.filter(isSectionKey);
  return keys.length ? keys : [...MEMORIAL_RICH_TEXT_SECTION_KEYS];
};

export const normalizeMemorialEditorState = (payload: unknown): MemorialEditorState => {
  const record = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : {};

  return {
    arrangements: readRecordList(record, 'arrangements'),
    gallery_items: readRecordList(record, 'gallery_items'),
    media_embeds: readRecordList(record, 'media_embeds'),
    ministry_tributes: readRecordList(record, 'ministry_tributes'),
    page: record.page && typeof record.page === 'object'
      ? record.page as MemorialPage
      : null,
    personal_tributes: readRecordList(record, 'personal_tributes'),
    recording_sections: readRecordList(record, 'recording_sections'),
    rich_text_blocks: readRecordList(record, 'rich_text_blocks'),
    scripture_references: readRecordList(record, 'scripture_references'),
    section_keys: readSectionKeys(record.section_keys),
    timeline_events: readRecordList(record, 'timeline_events'),
  };
};

const toQueryString = (filters: MemorialListFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === 'ALL') return;
    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

const collectionPath = (resource: MemorialResource, filters?: MemorialListFilters) =>
  `/v1/memorial/${resource}/${toQueryString(filters)}`;

const detailPath = (resource: MemorialResource, id: number | string) =>
  `/v1/memorial/${resource}/${encodeURIComponent(String(id))}/`;

const fetchMemorialCollection = async <T>(
  accessToken: string,
  resource: MemorialResource,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  normalizeMemorialPage<T>(
    await memorialRequest<unknown>(collectionPath(resource, filters), {
      accessToken,
      signal,
    }),
  );

const fetchMemorialDetail = <T>(
  accessToken: string,
  resource: MemorialResource,
  id: number | string,
  signal?: AbortSignal,
) =>
  memorialRequest<T>(detailPath(resource, id), { accessToken, signal });

const createMemorialRecord = <T>(
  accessToken: string,
  resource: MemorialResource,
  body: unknown,
) =>
  memorialRequest<T>(collectionPath(resource), {
    accessToken,
    body,
    method: 'POST',
  });

const updateMemorialRecord = <T>(
  accessToken: string,
  resource: MemorialResource,
  id: number | string,
  body: unknown,
) =>
  memorialRequest<T>(detailPath(resource, id), {
    accessToken,
    body,
    method: 'PATCH',
  });

const deleteMemorialRecord = (
  accessToken: string,
  resource: MemorialResource,
  id: number | string,
) =>
  memorialRequest<null>(detailPath(resource, id), {
    accessToken,
    method: 'DELETE',
  });

export const runMemorialWorkflowAction = <T>(
  accessToken: string,
  resource: MemorialWorkflowResource,
  id: number | string,
  action: MemorialWorkflowAction,
) =>
  memorialRequest<T>(`${detailPath(resource, id)}${action}/`, {
    accessToken,
    method: 'POST',
  });

export const fetchMemorialPages = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) => fetchMemorialCollection<MemorialPage>(accessToken, 'pages', filters, signal);

export const fetchMemorialPage = (
  accessToken: string,
  id: number | string,
  signal?: AbortSignal,
) => fetchMemorialDetail<MemorialPage>(accessToken, 'pages', id, signal);

export const fetchMemorialPageBySlug = (
  accessToken: string,
  slug: string,
  signal?: AbortSignal,
) =>
  memorialRequest<MemorialPage>(
    `/v1/memorial/pages/by-slug/${encodeURIComponent(slug)}/`,
    { accessToken, signal },
  );

export const fetchMemorialEditorState = async (
  accessToken: string,
  id: number | string,
  signal?: AbortSignal,
) =>
  normalizeMemorialEditorState(
    await memorialRequest<unknown>(
      `/v1/memorial/pages/${encodeURIComponent(String(id))}/editor-state/`,
      { accessToken, signal },
    ),
  );

export const createMemorialPage = (
  accessToken: string,
  body: MemorialPageCreatePayload,
) => createMemorialRecord<MemorialPage>(accessToken, 'pages', body);

export const updateMemorialPage = (
  accessToken: string,
  id: number | string,
  body: MemorialPageUpdatePayload,
) => updateMemorialRecord<MemorialPage>(accessToken, 'pages', id, body);

export const deleteMemorialPage = (accessToken: string, id: number | string) =>
  deleteMemorialRecord(accessToken, 'pages', id);

export const fetchMemorialRichTextBlocks = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialRichTextBlock>(
    accessToken,
    'rich-text-blocks',
    filters,
    signal,
  );

export const createMemorialRichTextBlock = (
  accessToken: string,
  body: MemorialRichTextBlockCreatePayload,
) =>
  createMemorialRecord<MemorialRichTextBlock>(
    accessToken,
    'rich-text-blocks',
    body,
  );

export const updateMemorialRichTextBlock = (
  accessToken: string,
  id: number | string,
  body: MemorialRichTextBlockUpdatePayload,
) =>
  updateMemorialRecord<MemorialRichTextBlock>(
    accessToken,
    'rich-text-blocks',
    id,
    body,
  );

export const deleteMemorialRichTextBlock = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'rich-text-blocks', id);

export const fetchMemorialRichTextMediaEmbeds = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialRichTextMediaEmbed>(
    accessToken,
    'rich-text-media-embeds',
    filters,
    signal,
  );

export const createMemorialRichTextMediaEmbed = (
  accessToken: string,
  body: MemorialRichTextMediaEmbedPayload,
) =>
  createMemorialRecord<MemorialRichTextMediaEmbed>(
    accessToken,
    'rich-text-media-embeds',
    body,
  );

export const updateMemorialRichTextMediaEmbed = (
  accessToken: string,
  id: number | string,
  body: Partial<MemorialRichTextMediaEmbedPayload>,
) =>
  updateMemorialRecord<MemorialRichTextMediaEmbed>(
    accessToken,
    'rich-text-media-embeds',
    id,
    body,
  );

export const deleteMemorialRichTextMediaEmbed = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'rich-text-media-embeds', id);

export const fetchMemorialRichTextScriptureReferences = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialRichTextScriptureReference>(
    accessToken,
    'rich-text-scripture-references',
    filters,
    signal,
  );

export const createMemorialRichTextScriptureReference = (
  accessToken: string,
  body: MemorialRichTextScriptureReferencePayload,
) =>
  createMemorialRecord<MemorialRichTextScriptureReference>(
    accessToken,
    'rich-text-scripture-references',
    body,
  );

export const updateMemorialRichTextScriptureReference = (
  accessToken: string,
  id: number | string,
  body: Partial<MemorialRichTextScriptureReferencePayload>,
) =>
  updateMemorialRecord<MemorialRichTextScriptureReference>(
    accessToken,
    'rich-text-scripture-references',
    id,
    body,
  );

export const deleteMemorialRichTextScriptureReference = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'rich-text-scripture-references', id);

export const fetchMemorialMinistryTributes = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialMinistryTribute>(
    accessToken,
    'ministry-tributes',
    filters,
    signal,
  );

export const createMemorialMinistryTribute = (
  accessToken: string,
  body: MemorialMinistryTributeCreatePayload,
) =>
  createMemorialRecord<MemorialMinistryTribute>(
    accessToken,
    'ministry-tributes',
    body,
  );

export const updateMemorialMinistryTribute = (
  accessToken: string,
  id: number | string,
  body: MemorialMinistryTributeUpdatePayload,
) =>
  updateMemorialRecord<MemorialMinistryTribute>(
    accessToken,
    'ministry-tributes',
    id,
    body,
  );

export const deleteMemorialMinistryTribute = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'ministry-tributes', id);

export const fetchMemorialPersonalTributes = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialPersonalTribute>(
    accessToken,
    'personal-tributes',
    filters,
    signal,
  );

export const createMemorialPersonalTribute = (
  accessToken: string,
  body: MemorialPersonalTributeCreatePayload,
) =>
  createMemorialRecord<MemorialPersonalTribute>(
    accessToken,
    'personal-tributes',
    body,
  );

export const updateMemorialPersonalTribute = (
  accessToken: string,
  id: number | string,
  body: MemorialPersonalTributeUpdatePayload,
) =>
  updateMemorialRecord<MemorialPersonalTribute>(
    accessToken,
    'personal-tributes',
    id,
    body,
  );

export const deleteMemorialPersonalTribute = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'personal-tributes', id);

export const fetchMemorialTimelineEvents = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialTimelineEvent>(
    accessToken,
    'timeline-events',
    filters,
    signal,
  );

export const createMemorialTimelineEvent = (
  accessToken: string,
  body: MemorialTimelineEventCreatePayload,
) =>
  createMemorialRecord<MemorialTimelineEvent>(
    accessToken,
    'timeline-events',
    body,
  );

export const updateMemorialTimelineEvent = (
  accessToken: string,
  id: number | string,
  body: MemorialTimelineEventUpdatePayload,
) =>
  updateMemorialRecord<MemorialTimelineEvent>(
    accessToken,
    'timeline-events',
    id,
    body,
  );

export const deleteMemorialTimelineEvent = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'timeline-events', id);

export const fetchMemorialGalleryItems = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialGalleryItem>(
    accessToken,
    'gallery-items',
    filters,
    signal,
  );

export const createMemorialGalleryItem = (
  accessToken: string,
  body: MemorialGalleryItemCreatePayload,
) =>
  createMemorialRecord<MemorialGalleryItem>(
    accessToken,
    'gallery-items',
    body,
  );

export const updateMemorialGalleryItem = (
  accessToken: string,
  id: number | string,
  body: MemorialGalleryItemUpdatePayload,
) =>
  updateMemorialRecord<MemorialGalleryItem>(
    accessToken,
    'gallery-items',
    id,
    body,
  );

export const deleteMemorialGalleryItem = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'gallery-items', id);

export const fetchMemorialRecordingSections = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialRecordingSection>(
    accessToken,
    'recording-sections',
    filters,
    signal,
  );

export const createMemorialRecordingSection = (
  accessToken: string,
  body: MemorialRecordingSectionCreatePayload,
) =>
  createMemorialRecord<MemorialRecordingSection>(
    accessToken,
    'recording-sections',
    body,
  );

export const updateMemorialRecordingSection = (
  accessToken: string,
  id: number | string,
  body: MemorialRecordingSectionUpdatePayload,
) =>
  updateMemorialRecord<MemorialRecordingSection>(
    accessToken,
    'recording-sections',
    id,
    body,
  );

export const deleteMemorialRecordingSection = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'recording-sections', id);

export const fetchMemorialArrangements = (
  accessToken: string,
  filters?: MemorialListFilters,
  signal?: AbortSignal,
) =>
  fetchMemorialCollection<MemorialArrangement>(
    accessToken,
    'arrangements',
    filters,
    signal,
  );

export const createMemorialArrangement = (
  accessToken: string,
  body: MemorialArrangementCreatePayload,
) =>
  createMemorialRecord<MemorialArrangement>(accessToken, 'arrangements', body);

export const updateMemorialArrangement = (
  accessToken: string,
  id: number | string,
  body: MemorialArrangementUpdatePayload,
) =>
  updateMemorialRecord<MemorialArrangement>(
    accessToken,
    'arrangements',
    id,
    body,
  );

export const deleteMemorialArrangement = (
  accessToken: string,
  id: number | string,
) => deleteMemorialRecord(accessToken, 'arrangements', id);
