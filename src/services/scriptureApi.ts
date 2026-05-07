import type {
  BibleBook,
  BibleAnnotation,
  BibleChapterNote,
  BibleChapter,
  BibleChapterDetail,
  BibleComparisonChapter,
  BibleComparisonVerse,
  BibleCredit,
  BibleGlossaryEntry,
  BibleMarkerStatus,
  BibleNoteType,
  BibleResource,
  BibleResourceType,
  BibleSearchResult,
  BibleSourceRecord,
  BibleToken,
  BibleToolRecord,
  BibleVerse,
  BibleVersion,
  BibleVersionDetail,
  PaginatedResponse,
  VerseLookupResult,
} from '../types/scripture';
import { resolveApiBookReference } from '../utils/scriptureIntent';

const API_BASE_URL = (
  import.meta.env.VITE_SCRIPTURE_API_BASE_URL ?? (import.meta.env.DEV ? '' : 'https://api.aicnjoro.org')
).replace(/\/$/, '');

type UnknownRecord = Record<string, unknown>;

const toUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
const scriptureRequestCache = new Map<string, Promise<unknown>>();

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

const readOptionalNumber = (record: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return undefined;
};

const readBoolean = (record: UnknownRecord, keys: string[], fallback = false) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
  }

  return fallback;
};

const toPaginatedResponse = <T>(
  payload: unknown,
  mapItem: (item: unknown, index: number) => T,
): PaginatedResponse<T> => {
  const record = asRecord(payload);
  const results = unwrapCollection(payload).map(mapItem);

  return {
    count: readNumber(record, ['count'], results.length),
    next: readString(record, ['next']) || null,
    previous: readString(record, ['previous']) || null,
    results,
  };
};

const fetchJson = async (path: string) => {
  const url = toUrl(path);
  const cachedRequest = scriptureRequestCache.get(url);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Scripture API request failed: ${response.status}`);
    }

    return response.json() as Promise<unknown>;
  });

  scriptureRequestCache.set(url, request);

  try {
    return await request;
  } catch (error) {
    scriptureRequestCache.delete(url);
    throw error;
  }
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

const toSearchRecord = (item: unknown, index: number): BibleToolRecord => {
  const record = asRecord(item);
  const book = readString(record, ['book_name', 'book', 'book_id', 'osis_book']);
  const chapter = readString(record, ['chapter', 'chapter_number']);
  const verse = readString(record, ['verse', 'verse_number', 'number']);
  const computedReference = [book, chapter && verse ? `${chapter}:${verse}` : chapter].filter(Boolean).join(' ');
  const reference = readString(
    record,
    ['reference', 'display_reference', 'verse_reference', 'ref', 'osis_ref', 'title'],
    computedReference || `Result ${index + 1}`,
  );
  const text = readString(record, ['text', 'content', 'verseText', 'body', 'snippet']);
  const version = readString(record, ['version', 'version_abbr', 'version_id', 'translation']);

  return {
    id: readString(record, ['id', '_id', 'uuid'], `${reference}-${index}`),
    title: reference,
    subtitle: version || undefined,
    body: text || undefined,
    meta: readString(record, ['testament', 'language', 'language_code']) || undefined,
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

  if (type === 'section_heading' || type === 'section-heading' || type === 'section heading') {
    return 'section_heading';
  }

  if (type === 'speaker_label' || type === 'speaker-label' || type === 'speaker label') {
    return 'speaker_label';
  }

  if (
    type === 'translator_addition' ||
    type === 'translator-addition' ||
    type === 'translator addition'
  ) {
    return 'translator_addition';
  }

  if (type === 'word_study' || type === 'word-study' || type === 'word study') {
    return 'word_study';
  }

  if (type === 'paragraph' || type === 'poetry') {
    return type;
  }

  return type === 'other' ? 'other' : 'footnote';
};

const toChapterNote = (item: unknown, index: number, fallbackType: BibleNoteType, fallbackVerse?: number): BibleChapterNote => {
  const record = asRecord(item);
  const type = normalizeNoteType(readString(record, ['annotation_type', 'type', 'note_type', 'kind'], fallbackType));
  const verseNumber = readNumber(record, ['verse_number', 'verse', 'number'], fallbackVerse || 0);
  const reference = readString(record, ['reference', 'ref', 'target', 'osis_ref', 'verse_reference']);
  const text = readString(record, ['text', 'content', 'body', 'note', 'label', 'display'], reference);

  return {
    id: readString(record, ['id', '_id', 'uuid'], `${fallbackType}-${fallbackVerse || 'chapter'}-${index}`),
    anchorText: readString(record, ['anchor_text']) || undefined,
    endOffset: readOptionalNumber(record, ['end_offset']),
    verseNumber: verseNumber || fallbackVerse,
    type,
    placement: readString(record, ['placement']) || undefined,
    text,
    rawContent: readString(record, ['raw_content']) || undefined,
    reference: reference || undefined,
    sourceMarker: readString(record, ['source_marker']) || undefined,
    startOffset: readOptionalNumber(record, ['start_offset']),
  };
};

const toBibleSearchResult = (item: unknown, index: number): BibleSearchResult => {
  const record = asRecord(item);
  const book = asRecord(record.book);
  const chapter = readOptionalNumber(record, ['chapter', 'chapter_number']);
  const verseNumber = readOptionalNumber(record, ['verse_number', 'verse', 'number']);
  const bookName = readString(book, ['name', 'canonical_name']) || readString(record, ['book_name', 'book']);
  const computedReference = [
    bookName,
    chapter && verseNumber ? `${chapter}:${verseNumber}` : chapter,
  ].filter(Boolean).join(' ');
  const reference = readString(
    record,
    ['reference', 'display_reference', 'verse_reference', 'ref', 'osis_ref', 'title'],
    computedReference || `Result ${index + 1}`,
  );
  const version = readString(record, ['version', 'version_abbr', 'version_id', 'translation']);
  const searchType = readString(record, ['search_type']);
  const text = readString(record, ['text', 'content', 'verseText', 'body', 'snippet']);

  return {
    id: readString(record, ['id', '_id', 'uuid'], `${reference}-${index}`),
    title: reference,
    subtitle: version || undefined,
    body: text || undefined,
    meta: readString(record, ['testament', 'language', 'language_code']) || searchType || undefined,
    bookId: readString(book, ['osis_id']) || undefined,
    chapter,
    credit: toBibleCredit(record.credit),
    headline: readString(record, ['headline']) || undefined,
    isFuzzy: searchType === 'fuzzy',
    reference,
    searchType: searchType || undefined,
    testament: readString(record, ['testament']) || undefined,
    verseNumber,
    version: version || undefined,
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

const normalizeTestament = (value: string): BibleBook['testament'] => {
  const testament = value.toLowerCase();
  if (testament.startsWith('old') || testament === 'ot') return 'old';
  if (testament.startsWith('new') || testament === 'nt') return 'new';
  return undefined;
};

const toBibleVersion = (item: unknown, index: number): BibleVersion => {
  const record = asRecord(item);
  const abbreviation = readString(record, ['abbreviation', 'abbr', 'code', 'shortName']);
  const name = readString(record, ['name', 'title', 'label'], abbreviation || `Version ${index + 1}`);

  return {
    id: abbreviation || readString(record, ['code', 'id', '_id', 'uuid', 'versionId'], name),
    abbreviation: abbreviation || undefined,
    code: readString(record, ['code'], abbreviation) || undefined,
    isPublic: readBoolean(record, ['is_public'], true),
    language: readString(record, ['language']) || undefined,
    languageCode: readString(record, ['language_code', 'lang']) || undefined,
    licenseType: readString(record, ['license_type']) || undefined,
    name,
    publicationYear: readOptionalNumber(record, ['publication_year']),
    source: readString(record, ['source']) || undefined,
  };
};

const toBibleVersionDetail = (payload: unknown): BibleVersionDetail => {
  const version = toBibleVersion(payload, 0);
  const record = asRecord(payload);

  return {
    ...version,
    description: readString(record, ['description']) || undefined,
    licenseNotes: readString(record, ['license_notes']) || undefined,
    licenseUrl: readString(record, ['license_url']) || undefined,
    sourceUrl: readString(record, ['source_url']) || undefined,
  };
};

const toBibleBook = (item: unknown, index: number): BibleBook => {
  const record = asRecord(item);
  const osisId = readString(record, ['osis_id', 'osisId', 'canonical_abbreviation', 'code']);

  return {
    abbreviation: readString(record, ['abbreviation', 'abbr']) || undefined,
    canonicalAbbreviation: readString(record, ['canonical_abbreviation']) || undefined,
    canonicalName: readString(record, ['canonical_name']) || undefined,
    id: osisId || readString(record, ['abbreviation', 'bookId', 'id', '_id', 'uuid'], `book-${index + 1}`),
    longName: readString(record, ['long_name']) || undefined,
    name: readString(record, ['name', 'title', 'label', 'book'], `Book ${index + 1}`),
    number: readOptionalNumber(record, ['number', 'order']),
    osisId: osisId || undefined,
    testament: normalizeTestament(readString(record, ['testament', 'section'])),
  };
};

const toBibleCredit = (payload: unknown): BibleCredit | undefined => {
  const record = asRecord(payload);
  const source = readString(record, ['source']);
  const sourceUrl = readString(record, ['source_url']);
  const licenseType = readString(record, ['license_type']);
  const licenseNotes = readString(record, ['license_notes']);

  if (!source && !sourceUrl && !licenseType && !licenseNotes) {
    return undefined;
  }

  return {
    licenseNotes: licenseNotes || undefined,
    licenseType: licenseType || undefined,
    source: source || undefined,
    sourceUrl: sourceUrl || undefined,
  };
};

const toBibleAnnotation = (item: unknown, index: number, fallbackVerse?: number): BibleAnnotation => {
  const record = asRecord(item);

  return {
    anchorText: readString(record, ['anchor_text']) || undefined,
    content: readString(record, ['content', 'text', 'note', 'body']),
    endOffset: readOptionalNumber(record, ['end_offset']),
    id: readString(record, ['id', '_id', 'uuid'], `annotation-${fallbackVerse || 'chapter'}-${index}`),
    placement: readString(record, ['placement']) || undefined,
    rawContent: readString(record, ['raw_content']) || undefined,
    sourceMarker: readString(record, ['source_marker']) || undefined,
    startOffset: readOptionalNumber(record, ['start_offset']),
    type: normalizeNoteType(readString(record, ['annotation_type', 'type', 'note_type'], 'footnote')),
    verseNumber: readOptionalNumber(record, ['verse_number', 'verse']) || fallbackVerse,
  };
};

const toMarker = (item: unknown) => {
  const record = asRecord(item);
  return {
    note: readString(record, ['note', 'text', 'content']) || undefined,
    status: readString(record, ['status']) || undefined,
  };
};

const toBibleVersesFromChapterPayload = (payload: unknown): BibleVerse[] => {
  const verses = unwrapCollection(payload);
  const chapterNotes = collectChapterNotes(payload);
  const licenseNote = getLicenseNote(payload);

  return verses
    .map((item, index) => {
      const record = asRecord(item);
      const verseNumber = readNumber(
        record,
        ['verse_number', 'number', 'verse', 'verseNumber', 'order'],
        index + 1,
      );
      const verseNotes: BibleChapterNote[] = [];

      [
        [record.annotations, 'footnote'],
        [record.footnotes, 'footnote'],
        [record.notes, 'footnote'],
        [record.cross_references, 'cross_reference'],
        [record.crossReferences, 'cross_reference'],
        [record.textual_variants, 'textual_variant'],
      ].forEach(([collection, fallbackType]) => {
        if (Array.isArray(collection)) {
          collection.forEach((note, noteIndex) => {
            verseNotes.push(
              toChapterNote(note, noteIndex, fallbackType as BibleNoteType, verseNumber),
            );
          });
        }
      });

      const rawAnnotations = Array.isArray(record.annotations)
        ? record.annotations.map((annotation, annotationIndex) =>
            toBibleAnnotation(annotation, annotationIndex, verseNumber),
          )
        : [];
      const matchingChapterNotes = chapterNotes.filter(
        (note) => note.verseNumber === verseNumber,
      );
      const markers = Array.isArray(record.markers) ? record.markers.map(toMarker) : [];
      const display = readString(record, ['display']);

      return {
        id: readString(record, ['id', '_id', 'uuid', 'verseId'], `verse-${index + 1}`),
        display: display || undefined,
        footnotes: verseNotes.filter((note) => note.type === 'footnote'),
        number: verseNumber,
        text: readString(record, ['text', 'content', 'verseText', 'body']),
        isPresent: record.is_present === undefined ? true : Boolean(record.is_present),
        markers,
        notes: dedupeChapterNotes([...verseNotes, ...matchingChapterNotes]),
        rawAnnotations,
      };
    })
    .concat(
      licenseNote
        ? [
            {
              id: '__chapter_meta__',
              display: 'metadata',
              footnotes: [licenseNote],
              markers: [],
              number: 0,
              text: '',
              isPresent: false,
              notes: [licenseNote],
              rawAnnotations: [],
            },
          ]
        : [],
    );
};

export const getBibleVersions = async (): Promise<BibleVersion[]> => {
  const versions = await fetchFirstCollection(['/v1/bible/versions/?public=true', '/v1/bible/versions/']);

  return versions.map(toBibleVersion);
};

export const getBibleVersionDetail = async (versionId: string): Promise<BibleVersionDetail> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/`);
  return toBibleVersionDetail(payload);
};

export const getBibleBooks = async (versionId: string): Promise<BibleBook[]> => {
  const books = await fetchFirstCollection([`/v1/bible/versions/${encode(versionId)}/books/`]);

  return books.map(toBibleBook);
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

export const getBibleChapter = async (
  versionId: string,
  bookId: string,
  chapterNumber: number,
  options: { includeRaw?: boolean; includeTokens?: boolean } = {},
): Promise<BibleChapterDetail> => {
  const payload = await fetchJson(
    `/v1/bible/versions/${encode(versionId)}/books/${encode(bookId)}/chapters/${encode(
      chapterNumber,
    )}/${toQueryString({ include_raw: options.includeRaw, include_tokens: options.includeTokens })}`,
  );
  const record = asRecord(payload);

  return {
    book: toBibleBook(record.book || { name: bookId, osis_id: bookId }, 0),
    chapter: readNumber(record, ['chapter', 'chapter_number'], chapterNumber),
    credit: toBibleCredit(record.credit),
    version: toBibleVersion(record.version || { abbreviation: versionId, name: versionId }, 0),
    verses: toBibleVersesFromChapterPayload(payload),
  };
};

export const getBibleVerses = async (
  versionId: string,
  bookId: string,
  _chapterId: string,
  chapterNumber: number,
): Promise<BibleVerse[]> => {
  const chapter = await getBibleChapter(versionId, bookId, chapterNumber);
  return chapter.verses;
};

export const getBibleVersesByReference = async (
  versionId: string,
  book: string,
  chapterNumber: number,
): Promise<BibleVerse[]> => {
  const chapter = await getBibleChapter(versionId, resolveApiBookReference(book), chapterNumber);
  return chapter.verses;
};

export const getBibleResources = async (
  versionId: string,
  type?: BibleResourceType,
): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/resources/${toQueryString({ type })}`);
  return unwrapCollection(payload).map(toToolRecord);
};

export const getBibleResourceRecords = async (
  versionId: string,
  type?: BibleResourceType,
): Promise<PaginatedResponse<BibleResource>> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/resources/${toQueryString({ type })}`);

  return toPaginatedResponse(payload, (item, index) => {
    const record = asRecord(item);
    const title = readString(record, ['title', 'name', 'resource_type'], `Resource ${index + 1}`);

    return {
      id: readString(record, ['id', '_id', 'uuid'], `${title}-${index}`),
      content: readString(record, ['content', 'body', 'text']) || undefined,
      resourceType: readString(record, ['resource_type', 'type']) || undefined,
      title,
    };
  });
};

export const getBibleGlossary = async (versionId: string, query?: string): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/glossary/${toQueryString({ q: query })}`);
  return unwrapCollection(payload).map(toToolRecord);
};

export const getBibleGlossaryEntries = async (
  versionId: string,
  query?: string,
): Promise<PaginatedResponse<BibleGlossaryEntry>> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/glossary/${toQueryString({ q: query })}`);

  return toPaginatedResponse(payload, (item, index) => {
    const record = asRecord(item);
    const term = readString(record, ['term', 'title', 'name'], `Glossary item ${index + 1}`);

    return {
      definition: readString(record, ['definition', 'content', 'body', 'text']),
      id: readString(record, ['id', '_id', 'uuid'], `${term}-${index}`),
      term,
    };
  });
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

export const getBibleAnnotations = async (
  versionId: string,
  params: { book?: string; chapter?: number; type?: BibleNoteType } = {},
): Promise<PaginatedResponse<BibleAnnotation>> => {
  const payload = await fetchJson(
    `/v1/bible/versions/${encode(versionId)}/annotations/${toQueryString(params)}`,
  );

  return toPaginatedResponse(payload, toBibleAnnotation);
};

export const getBibleSources = async (
  versionId: string,
  params: { book?: string; chapter?: number; format?: string; verse?: number } = {},
): Promise<PaginatedResponse<BibleSourceRecord>> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/sources/${toQueryString(params)}`);

  return toPaginatedResponse(payload, (item) => {
    const record = asRecord(item);

    return {
      cleanText: readString(record, ['clean_text']) || undefined,
      rawText: readString(record, ['raw_text']) || undefined,
      sourceFile: readString(record, ['source_file']) || undefined,
      sourceFormat: readString(record, ['source_format']) || undefined,
      sourceId: readString(record, ['source_id']) || undefined,
    };
  });
};

export const getBibleTokens = async (
  versionId: string,
  params: { book?: string; chapter?: number; q?: string; verse?: number } = {},
): Promise<PaginatedResponse<BibleToken>> => {
  const payload = await fetchJson(`/v1/bible/versions/${encode(versionId)}/tokens/${toQueryString(params)}`);

  return toPaginatedResponse(payload, (item) => {
    const record = asRecord(item);

    return {
      endOffset: readOptionalNumber(record, ['end_offset']),
      lemma: readString(record, ['lemma']) || undefined,
      morphology: readString(record, ['morphology']) || undefined,
      normalized: readString(record, ['normalized']) || undefined,
      position: readOptionalNumber(record, ['position']),
      startOffset: readOptionalNumber(record, ['start_offset']),
      strong: readString(record, ['strong']) || undefined,
      token: readString(record, ['token']),
      tokenType: readString(record, ['token_type']) || undefined,
    };
  });
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
): Promise<BibleComparisonChapter> => {
  const payload = await fetchJson(
    `/v1/bible/compare/${toQueryString({ versions: versions.join(','), book: bookId, chapter })}`,
  );
  const payloadRecord = asRecord(payload);
  const backendResults = Array.isArray(payloadRecord.results) ? payloadRecord.results : [];

  if (backendResults.length > 0) {
    const verses = backendResults.map((item, index): BibleComparisonVerse => {
      const record = asRecord(item);
      const verseNumber = readNumber(record, ['verse_number', 'number', 'verse'], index + 1);
      const readings = Array.isArray(record.readings)
        ? record.readings.map((reading) => {
            const readingRecord = asRecord(reading);
            const markers = Array.isArray(readingRecord.markers) ? readingRecord.markers.map(toMarker) : [];

            return {
              display: readString(readingRecord, ['display']) || undefined,
              isPresent: readingRecord.is_present === undefined ? true : Boolean(readingRecord.is_present),
              markerNote: markers.find((marker) => marker.note)?.note,
              text: readString(readingRecord, ['text', 'content', 'verseText', 'body']),
              version: readString(readingRecord, ['version', 'version_abbr', 'abbreviation']),
            };
          })
        : [];

      return { readings, verseNumber };
    });
    const book = asRecord(payloadRecord.book);

    return {
      book: readString(book, ['name', 'canonical_name', 'osis_id'], bookId),
      bookId: readString(book, ['osis_id'], bookId),
      chapter: readNumber(payloadRecord, ['chapter', 'chapter_number'], chapter),
      versions,
      verses,
    };
  }

  const verseMap = new Map<number, BibleComparisonVerse>();
  const normalizedVersions = versions.map((version) => version.toLowerCase());
  const normalizeVersion = (version: string) => version.trim().toLowerCase();
  const isRequestedVersion = (version: string) => normalizedVersions.includes(normalizeVersion(version));
  const displayVersion = (version: string) => versions.find((item) => normalizeVersion(item) === normalizeVersion(version)) || version;
  const addReading = (version: string, verseNumber: number, text: string) => {
    if (!text) return;

    const existing = verseMap.get(verseNumber) || { verseNumber, readings: [] };
    const normalizedVersion = displayVersion(version);
    const existingReading = existing.readings.find((reading) => normalizeVersion(reading.version) === normalizeVersion(normalizedVersion));

    if (existingReading) {
      existingReading.text = text;
    } else {
      existing.readings.push({ version: normalizedVersion, text });
    }

    verseMap.set(verseNumber, existing);
  };
  const addVerseCollection = (version: string, collection: unknown[]) => {
    collection.forEach((item, index) => {
      const record = asRecord(item);
      const verseNumber = readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], index + 1);
      const text = readString(record, ['text', 'content', 'verseText', 'body']);

      addReading(version, verseNumber, text);
    });
  };
  const readVersionFromRecord = (record: UnknownRecord) => {
    const directVersion = readString(record, ['version', 'version_abbr', 'version_id', 'translation', 'abbreviation', 'abbr', 'code']);

    if (directVersion) {
      return directVersion;
    }

    const versionRecord = asRecord(record.version);
    return readString(versionRecord, ['abbreviation', 'abbr', 'code', 'version_abbr', 'id', 'name']);
  };
  const addReadingsObject = (verseNumber: number, value: unknown) => {
    const record = asRecord(value);

    Object.entries(record).forEach(([version, textValue]) => {
      if (!isRequestedVersion(version)) {
        return;
      }

      if (typeof textValue === 'string' || typeof textValue === 'number') {
        addReading(version, verseNumber, String(textValue));
        return;
      }

      const textRecord = asRecord(textValue);
      addReading(version, verseNumber, readString(textRecord, ['text', 'content', 'verseText', 'body']));
    });
  };
  const addReadingsArray = (verseNumber: number, collection: unknown[]) => {
    collection.forEach((item) => {
      const record = asRecord(item);
      const version = readVersionFromRecord(record);
      const text = readString(record, ['text', 'content', 'verseText', 'body']);

      if (version && isRequestedVersion(version)) {
        addReading(version, verseNumber, text);
      }
    });
  };
  const addVerseRow = (item: unknown, index: number) => {
    const record = asRecord(item);
    const verseNumber = readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], index + 1);

    versions.forEach((version) => {
      const text = readString(record, [version, version.toLowerCase()]);
      addReading(version, verseNumber, text);
    });

    ['texts', 'readings', 'translations', 'versions'].forEach((key) => {
      const value = record[key];

      if (Array.isArray(value)) {
        addReadingsArray(verseNumber, value);
      } else {
        addReadingsObject(verseNumber, value);
      }
    });

    const version = readVersionFromRecord(record);
    const text = readString(record, ['text', 'content', 'verseText', 'body']);
    if (version && text) {
      addReading(version, verseNumber, text);
    }
  };
  const addVersionPayload = (version: string, value: unknown) => {
    if (!isRequestedVersion(version)) {
      return;
    }

    const record = asRecord(value);
    const verses = unwrapCollection(value);

    if (verses.length > 0) {
      addVerseCollection(version, verses);
      return;
    }

    ['verses', 'results', 'items', 'data'].forEach((key) => {
      const collection = record[key];
      if (Array.isArray(collection)) {
        addVerseCollection(version, collection);
      }
    });

    const text = readString(record, ['text', 'content', 'verseText', 'body']);
    if (text) {
      addReading(version, readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], 1), text);
    }
  };
  const inspectContainer = (value: unknown) => {
    const collection = unwrapCollection(value);

    if (collection.length > 0) {
      collection.forEach((item, index) => {
        const record = asRecord(item);
        const version = readVersionFromRecord(record);
        const nestedVerses = unwrapCollection(record.verses || record.results || record.items || record.data);

        if (version && nestedVerses.length > 0) {
          addVerseCollection(version, nestedVerses);
          return;
        }

        addVerseRow(item, index);
      });
      return;
    }

    Object.entries(asRecord(value)).forEach(([key, nestedValue]) => {
      if (isRequestedVersion(key)) {
        addVersionPayload(key, nestedValue);
      }
    });
  };
  inspectContainer(payload);

  [
    payloadRecord.results,
    payloadRecord.data,
    payloadRecord.comparisons,
    payloadRecord.comparison,
    payloadRecord.translations,
    payloadRecord.versions,
  ].forEach(inspectContainer);

  versions.forEach((version) => {
    const versionPayload = payloadRecord[version];
    addVersionPayload(version, versionPayload);
  });

  return {
    book: readString(payloadRecord, ['book', 'book_id', 'book_name']) || readString(asRecord(payloadRecord.book), ['name', 'osis_id', 'abbreviation'], bookId),
    chapter: readNumber(payloadRecord, ['chapter', 'chapter_number'], chapter),
    versions,
    verses: Array.from(verseMap.values()).sort((left, right) => left.verseNumber - right.verseNumber),
  };
};

export const searchBible = async (params: {
  book?: string;
  language?: string;
  language_code?: string;
  q: string;
  page?: number;
  page_size?: number;
  fuzzy?: boolean;
  testament?: string;
  version?: string;
  versions?: string;
}): Promise<BibleToolRecord[]> => {
  const payload = await fetchJson(`/v1/bible/search/${toQueryString(params)}`);
  return unwrapCollection(payload).map(toSearchRecord);
};

export const searchBiblePaginated = async (params: {
  book?: string;
  fuzzy?: boolean;
  language?: string;
  language_code?: string;
  page?: number;
  page_size?: number;
  q: string;
  testament?: string;
  version?: string;
  versions?: string;
}): Promise<PaginatedResponse<BibleSearchResult>> => {
  const payload = await fetchJson(`/v1/bible/search/${toQueryString(params)}`);
  return toPaginatedResponse(payload, toBibleSearchResult);
};
