import type {
  ApiRequestOptions,
} from './apiClient';
import type {
  BibleBook,
  BibleChapter,
  BibleComparisonChapter,
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
  BibleToolRecord,
  BibleVerse,
  BibleVersion,
  VerseLookupResult,
} from '../types/scripture';
import { resolveApiBookReference } from '../utils/scriptureIntent';
import { apiGet } from './apiClient';
import {
  asRecord,
  normalizeBooksResponse,
  normalizeChapterDetailResponse,
  normalizeChaptersResponse,
  normalizeComparisonResponse,
  normalizeSearchRecordsResponse,
  normalizeToolRecordsResponse,
  normalizeVersionsResponse,
  readString,
} from './scriptureNormalizers';

const encode = (value: string | number) => encodeURIComponent(String(value));

const toQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
};

const cachedGet = <T>(path: string) => apiGet<T>(path, { cache: 'memory' });
const freshGet = <T>(path: string, options: ApiRequestOptions = {}) =>
  apiGet<T>(path, { ...options, cache: 'none' });

export const getBibleVersions = async (): Promise<BibleVersion[]> => {
  const payload = await cachedGet<unknown>('/v1/bible/versions/?public=true');
  return normalizeVersionsResponse(payload);
};

export const getBibleBooks = async (versionId: string): Promise<BibleBook[]> => {
  const payload = await cachedGet<unknown>(`/v1/bible/versions/${encode(versionId)}/books/`);
  return normalizeBooksResponse(payload);
};

export const getBibleChapters = async (versionId: string, bookId: string): Promise<BibleChapter[]> => {
  const payload = await cachedGet<unknown>(`/v1/bible/versions/${encode(versionId)}/books/${encode(bookId)}/chapters/`);
  return normalizeChaptersResponse(payload);
};

export const getBibleVerses = async (
  versionId: string,
  bookId: string,
  _chapterId: string,
  chapterNumber: number,
): Promise<BibleVerse[]> => {
  const payload = await cachedGet<unknown>(
    `/v1/bible/versions/${encode(versionId)}/books/${encode(bookId)}/chapters/${encode(chapterNumber)}/`,
  );
  return normalizeChapterDetailResponse(payload);
};

export const getBibleVersesByReference = async (
  versionId: string,
  book: string,
  chapterNumber: number,
): Promise<BibleVerse[]> => {
  const payload = await cachedGet<unknown>(
    `/v1/bible/versions/${encode(versionId)}/books/${encode(resolveApiBookReference(book))}/chapters/${encode(chapterNumber)}/`,
  );
  return normalizeChapterDetailResponse(payload);
};

export const getBibleResources = async (
  versionId: string,
  type?: BibleResourceType,
): Promise<BibleToolRecord[]> => {
  const payload = await freshGet<unknown>(`/v1/bible/versions/${encode(versionId)}/resources/${toQueryString({ type })}`);
  return normalizeToolRecordsResponse(payload);
};

export const getBibleGlossary = async (versionId: string, query?: string): Promise<BibleToolRecord[]> => {
  const payload = await freshGet<unknown>(`/v1/bible/versions/${encode(versionId)}/glossary/${toQueryString({ q: query })}`);
  return normalizeToolRecordsResponse(payload);
};

export const getBibleMarkers = async (
  versionId: string,
  status?: BibleMarkerStatus,
): Promise<BibleToolRecord[]> => {
  const payload = await freshGet<unknown>(`/v1/bible/versions/${encode(versionId)}/markers/${toQueryString({ status })}`);
  return normalizeToolRecordsResponse(payload);
};

export const getBibleNotes = async (versionId: string, type?: BibleNoteType): Promise<BibleToolRecord[]> => {
  const payload = await freshGet<unknown>(`/v1/bible/versions/${encode(versionId)}/notes/${toQueryString({ type })}`);
  return normalizeToolRecordsResponse(payload);
};

export const lookupBibleVerse = async (
  versionId: string,
  bookId: string,
  chapter: number,
  verse: number,
): Promise<VerseLookupResult> => {
  const payload = await cachedGet<unknown>(
    `/v1/bible/versions/${encode(versionId)}/verses/${encode(bookId)}/${encode(chapter)}/${encode(verse)}/`,
  );
  const record = asRecord(payload);

  return {
    display: readString(record, ['display']) || undefined,
    footnotes: Array.isArray(record.footnotes) ? record.footnotes : undefined,
    isPresent: record.is_present === undefined ? true : Boolean(record.is_present),
    reference: `${bookId} ${chapter}:${verse}`,
    text: readString(record, ['text', 'content', 'verseText', 'body']),
  };
};

export const compareBibleChapter = async (
  versions: string[],
  bookId: string,
  chapter: number,
): Promise<BibleComparisonChapter> => {
  const payload = await freshGet<unknown>(
    `/v1/bible/compare/${toQueryString({ versions: versions.join(','), book: bookId, chapter })}`,
  );
  return normalizeComparisonResponse(payload, versions, bookId, chapter);
};

export const searchBible = async (params: {
  book?: string;
  language?: string;
  language_code?: string;
  q: string;
  testament?: string;
  version?: string;
  versions?: string;
}, options: ApiRequestOptions = {}): Promise<BibleToolRecord[]> => {
  const payload = await freshGet<unknown>(`/v1/bible/search/${toQueryString(params)}`, options);
  return normalizeSearchRecordsResponse(payload);
};
