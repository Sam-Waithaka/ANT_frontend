import type {
  BibleBook,
  BibleChapterNote,
  BibleChapter,
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
  BibleToolRecord,
  BibleVerse,
  BibleVersion,
  VerseLookupResult,
} from '../types/scripture';

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

const toToolRecord = (item: unknown, index: number): BibleToolRecord => {
  const record = asRecord(item);
  const title = readString(
    record,
    ['reference', 'title', 'heading', 'term', 'name', 'type', 'status', 'book', 'verse_reference'],
    `Result ${index + 1}`,
  );
  const subtitle = readString(record, ['subtitle', 'ref', 'location', 'language', 'note_type', 'resource_type']);
  const body = readString(record, ['text', 'content', 'body', 'definition', 'note', 'description', 'license_notes']);
  const meta = readString(record, ['version', 'version_abbr', 'source', 'license_type', 'display']);

  return {
    id: readString(record, ['id', '_id', 'uuid'], `${title}-${index}`),
    title,
    subtitle: subtitle || undefined,
    body: body || undefined,
    meta: meta || undefined,
  };
};

const normalizeNoteType = (value: string): BibleNoteType => {
  const type = value.toLowerCase();

  if (type === 'cross_reference' || type === 'cross-reference' || type === 'cross reference') {
    return 'cross_reference';
  }

  if (type === 'textual_variant' || type === 'textual-variant' || type === 'textual variant') {
    return 'textual_variant';
  }

  return 'footnote';
};

const toChapterNote = (item: unknown, index: number, fallbackType: BibleNoteType, fallbackVerse?: number): BibleChapterNote => {
  const record = asRecord(item);
  const type = normalizeNoteType(readString(record, ['type', 'note_type', 'kind'], fallbackType));
  const verseNumber = readNumber(record, ['verse_number', 'verse', 'number'], fallbackVerse || 0);
  const reference = readString(record, ['reference', 'ref', 'target', 'osis_ref', 'verse_reference']);
  const text = readString(record, ['text', 'content', 'body', 'note', 'label', 'display'], reference);

  return {
    id: readString(record, ['id', '_id', 'uuid'], `${fallbackType}-${fallbackVerse || 'chapter'}-${index}`),
    verseNumber: verseNumber || fallbackVerse,
    type,
    text,
    reference: reference || undefined,
  };
};

const collectChapterNotes = (payload: unknown) => {
  const payloadRecord = asRecord(payload);
  const chapterNotes: BibleChapterNote[] = [];

  const noteCollections: Array<[unknown, BibleNoteType]> = [
    [payloadRecord.footnotes, 'footnote'],
    [payloadRecord.marker_footnotes, 'footnote'],
    [payloadRecord.omitted_verse_footnotes, 'footnote'],
    [payloadRecord.cross_references, 'cross_reference'],
    [payloadRecord.crossReferences, 'cross_reference'],
    [payloadRecord.notes, 'footnote'],
    [payloadRecord.verse_notes, 'footnote'],
    [payloadRecord.textual_variants, 'textual_variant'],
  ];

  noteCollections.forEach(([collection, fallbackType]) => {
    if (Array.isArray(collection)) {
      collection.forEach((item, index) => {
        chapterNotes.push(toChapterNote(item, index, fallbackType));
      });
    }
  });

  return chapterNotes;
};

const dedupeChapterNotes = (notes: BibleChapterNote[]) => {
  const seen = new Set<string>();

  return notes.filter((note) => {
    const key = `${note.type}|${note.verseNumber || ''}|${note.reference || ''}|${note.text}`.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getLicenseNote = (payload: unknown): BibleChapterNote | null => {
  const payloadRecord = asRecord(payload);
  const credit = asRecord(payloadRecord.credit);
  const licenseNotes = readString(credit, ['license_notes']);

  if (!licenseNotes) {
    return null;
  }

  return {
    id: 'chapter-license-notes',
    type: 'footnote',
    text: licenseNotes,
    reference: 'license',
  };
};

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
      abbreviation: readString(record, ['abbreviation', 'abbr']),
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
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/books/${encode(bookId)}/chapters/${encode(chapterNumber)}/`);
  const verses = unwrapCollection(payload);
  const chapterNotes = collectChapterNotes(payload);
  const licenseNote = getLicenseNote(payload);

  return verses.map((item, index) => {
    const record = asRecord(item);
    const verseNumber = readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], index + 1);
    const verseNotes: BibleChapterNote[] = [];

    [
      [record.footnotes, 'footnote'],
      [record.notes, 'footnote'],
      [record.cross_references, 'cross_reference'],
      [record.crossReferences, 'cross_reference'],
      [record.textual_variants, 'textual_variant'],
    ].forEach(([collection, fallbackType]) => {
      if (Array.isArray(collection)) {
        collection.forEach((note, noteIndex) => {
          verseNotes.push(toChapterNote(note, noteIndex, fallbackType as BibleNoteType, verseNumber));
        });
      }
    });

    const matchingChapterNotes = chapterNotes.filter((note) => note.verseNumber === verseNumber);

    return {
      id: readString(record, ['id', '_id', 'uuid', 'verseId'], `verse-${index + 1}`),
      number: verseNumber,
      text: readString(record, ['text', 'content', 'verseText', 'body']),
      isPresent: record.is_present === undefined ? true : Boolean(record.is_present),
      notes: dedupeChapterNotes([...verseNotes, ...matchingChapterNotes]),
    };
  }).concat(
    licenseNote
      ? [{
          id: '__chapter_meta__',
          number: 0,
          text: '',
          isPresent: false,
          notes: [licenseNote],
        }]
      : [],
  );
};

export const getBibleResources = async (
  versionId: string,
  type?: BibleResourceType,
): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/resources/${toQueryString({ type })}`);
  return unwrapCollection(payload).map(toToolRecord);
};

export const getBibleGlossary = async (versionId: string, query?: string): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/glossary/${toQueryString({ q: query })}`);
  return unwrapCollection(payload).map(toToolRecord);
};

export const getBibleMarkers = async (
  versionId: string,
  status?: BibleMarkerStatus,
): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/markers/${toQueryString({ status })}`);
  return unwrapCollection(payload).map(toToolRecord);
};

export const getBibleNotes = async (versionId: string, type?: BibleNoteType): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/notes/${toQueryString({ type })}`);
  return unwrapCollection(payload).map(toToolRecord);
};

export const lookupBibleVerse = async (
  versionId: string,
  bookId: string,
  chapter: number,
  verse: number,
): Promise<VerseLookupResult> => {
  const payload = await fetchJson(
    `/v1/bible/versions/${encode(versionId)}/verses/${encode(bookId)}/${encode(chapter)}/${encode(verse)}/`,
  );
  const record = asRecord(payload);

  return {
    reference: `${bookId} ${chapter}:${verse}`,
    text: readString(record, ['text', 'content', 'verseText', 'body']),
    isPresent: record.is_present === undefined ? true : Boolean(record.is_present),
    display: readString(record, ['display']) || undefined,
    footnotes: Array.isArray(record.footnotes) ? record.footnotes : undefined,
  };
};

export const compareBibleChapter = async (
  versions: string[],
  bookId: string,
  chapter: number,
): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(
    `/v1/bible/compare/${toQueryString({ versions: versions.join(','), book: bookId, chapter })}`,
  );
  const collection = unwrapCollection(payload);

  if (collection.length > 0) {
    return collection.map(toToolRecord);
  }

  return Object.entries(asRecord(payload)).map(([version, value], index) => {
    const record = asRecord(value);
    return {
      id: `${version}-${index}`,
      title: version,
      body: readString(record, ['text', 'content', 'body']) || JSON.stringify(value),
    };
  });
};

export const searchBible = async (params: {
  book?: string;
  language?: string;
  language_code?: string;
  q: string;
  testament?: string;
  version?: string;
  versions?: string;
}): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(`/v1/bible/search/${toQueryString(params)}`);
  return unwrapCollection(payload).map(toToolRecord);
};
