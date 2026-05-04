import type { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../types/scripture';

const API_BASE_URL = (
  import.meta.env.VITE_SCRIPTURE_API_BASE_URL ?? (import.meta.env.DEV ? '' : 'https://api.aicnjoro.org')
).replace(/\/$/, '');

type UnknownRecord = Record<string, unknown>;

const toUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const asRecord = (value: unknown): UnknownRecord => (value && typeof value === 'object' ? value as UnknownRecord : {});

const unwrapCollection = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  const candidates = [record.data, record.items, record.results, record.versions, record.books, record.chapters, record.verses];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const readString = (record: UnknownRecord, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }

  return fallback;
};

const readNumber = (record: UnknownRecord, keys: string[], fallback: number) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string' && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
};

const fetchJson = async (path: string) => {
  const response = await fetch(toUrl(path), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Scripture API request failed: ${response.status}`);
  }

  return response.json();
};

const fetchFirstCollection = async (paths: string[]) => {
  let lastError: unknown;

  for (const path of paths) {
    try {
      const payload = await fetchJson(path);
      const collection = unwrapCollection(payload);

      if (collection.length > 0) {
        return collection;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Scripture API returned no data.');
};

const encode = (value: string | number) => encodeURIComponent(String(value));

export const getBibleVersions = async (): Promise<BibleVersion[]> => {
  const versions = await fetchFirstCollection(['/v1/bible/versions/']);

  return versions.map((item, index) => {
    const record = asRecord(item);
    const abbreviation = readString(record, ['abbreviation', 'abbr', 'code', 'shortName']);
    const name = readString(record, ['name', 'title', 'label'], abbreviation || `Version ${index + 1}`);

    return {
      id: abbreviation || readString(record, ['id', '_id', 'uuid', 'versionId', 'code'], name),
      name,
      abbreviation: abbreviation || undefined,
    };
  });
};

export const getBibleBooks = async (versionId: string): Promise<BibleBook[]> => {
  const books = await fetchFirstCollection([`/v1/bible/versions/${encode(versionId)}/books/`]);

  return books.map((item, index) => {
    const record = asRecord(item);
    const testament = readString(record, ['testament', 'section']).toLowerCase();

    return {
      id: readString(record, ['osis_id', 'osisId', 'abbreviation', 'code', 'bookId', 'id', '_id', 'uuid'], `book-${index + 1}`),
      name: readString(record, ['name', 'title', 'label', 'book'], `Book ${index + 1}`),
      testament: testament.startsWith('old') || testament === 'ot' ? 'old' : testament.startsWith('new') || testament === 'nt' ? 'new' : undefined,
    };
  });
};

export const getBibleChapters = async (versionId: string, bookId: string): Promise<BibleChapter[]> => {
  const chapters = await fetchFirstCollection([
    `/v1/bible/versions/${encode(versionId)}/books/${encode(bookId)}/chapters/`,
  ]);

  return chapters.map((item, index) => {
    const record = asRecord(item);
    const number = readNumber(record, ['number', 'chapter', 'chapterNumber', 'order'], index + 1);

    return {
      id: readString(record, ['id', '_id', 'uuid', 'chapterId'], String(number)),
      number,
      label: readString(record, ['label', 'name', 'title'], `Chapter ${number}`),
    };
  });
};

export const getBibleVerses = async (
  versionId: string,
  bookId: string,
  _chapterId: string,
  chapterNumber: number,
): Promise<BibleVerse[]> => {
  const verses = await fetchFirstCollection([
    `/v1/bible/versions/${encode(versionId)}/books/${encode(bookId)}/chapters/${encode(chapterNumber)}/`,
  ]);

  return verses.map((item, index) => {
    const record = asRecord(item);

    return {
      id: readString(record, ['id', '_id', 'uuid', 'verseId'], `verse-${index + 1}`),
      number: readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], index + 1),
      text: readString(record, ['text', 'content', 'verseText', 'body']),
    };
  });
};
