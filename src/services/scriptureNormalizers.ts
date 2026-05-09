import type {
  BibleBook,
  BibleChapterCredit,
  BibleChapter,
  BibleChapterNote,
  BibleComparisonChapter,
  BibleComparisonVerse,
  BibleNoteType,
  BibleSearchResponse,
  BibleSearchResult,
  BibleToolRecord,
  BibleToolResponse,
  BibleVerse,
  BibleVersion,
  PaginatedResponse,
} from '../types/scripture';

type UnknownRecord = Record<string, unknown>;

export const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? value as UnknownRecord : {};

export const unwrapCollection = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  const candidates = [
    record.data,
    record.items,
    record.results,
    record.versions,
    record.books,
    record.chapters,
    record.verses,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

export const readString = (record: UnknownRecord, keys: string[], fallback = '') => {
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

export const readNumber = (record: UnknownRecord, keys: string[], fallback: number) => {
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

const readBoolean = (record: UnknownRecord, keys: string[], fallback?: boolean) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
    }
  }

  return fallback;
};

export const normalizePaginatedResponse = <T>(
  payload: unknown,
  normalizeItem: (item: unknown, index: number) => T,
): PaginatedResponse<T> => {
  const record = asRecord(payload);
  const results = unwrapCollection(payload).map(normalizeItem);

  return {
    count: readNumber(record, ['count'], results.length),
    next: readString(record, ['next']) || null,
    previous: readString(record, ['previous']) || null,
    results,
  };
};

export const normalizeVersionsResponse = (payload: unknown): BibleVersion[] =>
  unwrapCollection(payload).map((item, index) => {
    const record = asRecord(item);
    const abbreviation = readString(record, ['abbreviation', 'code', 'abbr', 'shortName']);
    const name = readString(record, ['name', 'title', 'label'], abbreviation || `Version ${index + 1}`);

    return {
      abbreviation: abbreviation || undefined,
      description: readString(record, ['description']) || undefined,
      id: abbreviation || readString(record, ['code', 'id', '_id', 'uuid', 'versionId'], name),
      isPublic: readBoolean(record, ['is_public', 'public']),
      language: readString(record, ['language']) || undefined,
      languageCode: readString(record, ['language_code', 'lang']) || undefined,
      licenseNotes: readString(record, ['license_notes']) || undefined,
      licenseType: readString(record, ['license_type']) || undefined,
      licenseUrl: readString(record, ['license_url']) || undefined,
      name,
      publicationYear: readNumber(record, ['publication_year', 'year'], 0) || undefined,
      source: readString(record, ['source']) || undefined,
      sourceUrl: readString(record, ['source_url']) || undefined,
    };
  });

export const normalizeBooksResponse = (payload: unknown): BibleBook[] =>
  unwrapCollection(payload).map((item, index) => {
    const record = asRecord(item);
    const testament = readString(record, ['testament', 'section']).toLowerCase();

    return {
      abbreviation: readString(record, ['abbreviation', 'abbr']) || undefined,
      canonicalAbbreviation: readString(record, ['canonical_abbreviation']) || undefined,
      canonicalName: readString(record, ['canonical_name']) || undefined,
      id: readString(record, ['osis_id', 'osisId', 'canonical_abbreviation', 'code', 'bookId', 'id', '_id', 'uuid'], `book-${index + 1}`),
      longName: readString(record, ['long_name']) || undefined,
      name: readString(record, ['name', 'title', 'label', 'book'], `Book ${index + 1}`),
      number: readNumber(record, ['number', 'order'], 0) || undefined,
      testament: testament.startsWith('old') || testament === 'ot'
        ? 'old'
        : testament.startsWith('new') || testament === 'nt'
          ? 'new'
          : undefined,
    };
  });

export const normalizeChaptersResponse = (payload: unknown): BibleChapter[] =>
  // The backend returns chapter_numbers for lean chapter lists; keep chapter objects when they exist.
  (unwrapCollection(payload).length > 0
    ? unwrapCollection(payload)
    : Array.isArray(asRecord(payload).chapter_numbers)
      ? (asRecord(payload).chapter_numbers as unknown[])
      : []
  ).map((item, index) => {
    const record = asRecord(item);
    const primitiveNumber = typeof item === 'number' || typeof item === 'string' ? Number(item) : 0;
    const number = primitiveNumber || readNumber(record, ['number', 'chapter', 'chapterNumber', 'order'], index + 1);

    return {
      id: readString(record, ['id', '_id', 'uuid', 'chapterId'], String(number)),
      label: readString(record, ['label', 'name', 'title'], `Chapter ${number}`),
      number,
    };
  });

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

export const normalizeChapterNote = (
  item: unknown,
  index: number,
  fallbackType: BibleNoteType,
  fallbackVerse?: number,
): BibleChapterNote => {
  const record = asRecord(item);
  const type = normalizeNoteType(readString(record, ['type', 'note_type', 'annotation_type', 'kind'], fallbackType));
  const verseNumber = readNumber(record, ['verse_number', 'verse', 'number'], fallbackVerse || 0);
  const reference = readString(record, ['reference', 'ref', 'target', 'osis_ref', 'verse_reference']);
  const text = readString(record, ['text', 'content', 'body', 'note', 'label', 'display'], reference);

  return {
    id: readString(record, ['id', '_id', 'uuid'], `${fallbackType}-${fallbackVerse || 'chapter'}-${index}`),
    reference: reference || undefined,
    text,
    type,
    verseNumber: verseNumber || fallbackVerse,
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
        chapterNotes.push(normalizeChapterNote(item, index, fallbackType));
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
    reference: 'license',
    text: licenseNotes,
    type: 'footnote',
  };
};

const normalizeChapterCredit = (payload: unknown): BibleChapterCredit | undefined => {
  const credit = asRecord(asRecord(payload).credit);

  if (Object.keys(credit).length === 0) {
    return undefined;
  }

  return {
    licenseNotes: readString(credit, ['license_notes']) || undefined,
    licenseType: readString(credit, ['license_type']) || undefined,
    licenseUrl: readString(credit, ['license_url']) || undefined,
    source: readString(credit, ['source']) || undefined,
    sourceUrl: readString(credit, ['source_url']) || undefined,
  };
};

export const normalizeVerseAnnotations = (collection: unknown, fallbackVerseNumber = 0) => {
  if (!Array.isArray(collection)) {
    return [];
  }

  return collection.map((item, index) => {
    const record = asRecord(item);
    const type = readString(record, ['annotation_type', 'type'], 'other');
    const content = readString(record, ['content', 'text', 'body', 'note']);
    const verseNumber = readNumber(record, ['verse_number', 'verse', 'number'], fallbackVerseNumber);

    return {
      anchorText: readString(record, ['anchor_text']) || undefined,
      content,
      endOffset: readNumber(record, ['end_offset'], -1) >= 0 ? readNumber(record, ['end_offset'], -1) : undefined,
      id: readString(record, ['id', '_id', 'uuid'], `${type}-${verseNumber}-${index}`),
      placement: readString(record, ['placement']) || undefined,
      rawContent: readString(record, ['raw_content']) || undefined,
      sourceMarker: readString(record, ['source_marker']) || undefined,
      startOffset: readNumber(record, ['start_offset'], -1) >= 0 ? readNumber(record, ['start_offset'], -1) : undefined,
      type,
      verseNumber,
    };
  });
};

export const normalizeAnnotationsResponse = (payload: unknown) =>
  normalizeVerseAnnotations(unwrapCollection(payload));

export const normalizeChapterDetailResponse = (payload: unknown): BibleVerse[] => {
  const verses = unwrapCollection(payload);
  const chapterNotes = collectChapterNotes(payload);
  const licenseNote = getLicenseNote(payload);
  const chapterCredit = normalizeChapterCredit(payload);
  const normalizedVerses: BibleVerse[] = verses.map((item, index) => {
      const record = asRecord(item);
      const verseNumber = readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], index + 1);
      const verseNotes: BibleChapterNote[] = [];
      const crossReferences: BibleChapterNote[] = [];
      const footnotes: BibleChapterNote[] = [];

      [
        [record.notes, 'footnote'],
        [record.textual_variants, 'textual_variant'],
      ].forEach(([collection, fallbackType]) => {
        if (Array.isArray(collection)) {
          collection.forEach((note, noteIndex) => {
            verseNotes.push(normalizeChapterNote(note, noteIndex, fallbackType as BibleNoteType, verseNumber));
          });
        }
      });

      if (Array.isArray(record.footnotes)) {
        record.footnotes.forEach((note, noteIndex) => {
          const normalizedNote = normalizeChapterNote(note, noteIndex, 'footnote', verseNumber);
          footnotes.push(normalizedNote);
          verseNotes.push(normalizedNote);
        });
      }

      [record.cross_references, record.crossReferences].forEach((collection) => {
        if (Array.isArray(collection)) {
          collection.forEach((note, noteIndex) => {
            crossReferences.push(normalizeChapterNote(note, noteIndex, 'cross_reference', verseNumber));
          });
        }
      });

      const matchingChapterNotes = chapterNotes.filter((note) => note.verseNumber === verseNumber);

      return {
        annotations: normalizeVerseAnnotations(record.annotations, verseNumber),
        chapterCredit,
        crossReferences: dedupeChapterNotes(crossReferences),
        display: readString(record, ['display']) || undefined,
        footnotes: dedupeChapterNotes(footnotes),
        id: readString(record, ['id', '_id', 'uuid', 'verseId'], `verse-${index + 1}`),
        isPresent: readBoolean(record, ['is_present'], true),
        markers: Array.isArray(record.markers)
          ? record.markers.map((marker) => {
              const markerRecord = asRecord(marker);
              return {
                note: readString(markerRecord, ['note', 'text', 'message']) || undefined,
                status: readString(markerRecord, ['status'], 'source_unavailable'),
              };
            })
          : undefined,
        notes: dedupeChapterNotes([...verseNotes, ...crossReferences, ...matchingChapterNotes]),
        number: verseNumber,
        text: readString(record, ['text', 'content', 'verseText', 'body']),
      };
    });

  return normalizedVerses.concat(
    // Keep chapter-level license notes outside the verse stream while still exposing them to the reader UI.
    licenseNote
      ? [{
          id: '__chapter_meta__',
          isPresent: false,
          notes: [licenseNote],
          number: 0,
          text: '',
        }]
      : [],
  );
};

export const normalizeToolRecordsResponse = (payload: unknown): BibleToolRecord[] =>
  unwrapCollection(payload).map((item, index) => {
    const record = asRecord(item);
    const title = readString(
      record,
      ['reference', 'title', 'heading', 'term', 'name', 'type', 'status', 'book', 'verse_reference'],
      `Result ${index + 1}`,
    );
    const subtitle = readString(record, ['subtitle', 'ref', 'location', 'language', 'note_type', 'resource_type']);
    const body = readString(record, ['text', 'content', 'body', 'definition', 'note', 'description', 'license_notes']);
    const meta = readString(record, ['version', 'version_abbr', 'status', 'source', 'license_type', 'display']);

    return {
      body: body || undefined,
      id: readString(record, ['id', '_id', 'uuid'], `${title}-${index}`),
      meta: meta || undefined,
      subtitle: subtitle || undefined,
      title,
    };
  });

export const normalizeToolResponse = (payload: unknown): BibleToolResponse =>
  normalizePaginatedResponse(payload, (item, index) => normalizeToolRecordsResponse([item])[0] || {
    id: `tool-record-${index}`,
    title: `Result ${index + 1}`,
  });

export const normalizeSearchRecordsResponse = (payload: unknown): BibleToolRecord[] =>
  unwrapCollection(payload).map((item, index) => {
    const record = asRecord(item);
    const bookRecord = asRecord(record.book);
    const book = readString(bookRecord, ['name', 'canonical_name', 'osis_id']) || readString(record, ['book_name', 'book', 'book_id', 'osis_book']);
    const chapter = readString(record, ['chapter', 'chapter_number']);
    const verse = readString(record, ['verse_number', 'verse', 'number']);
    const computedReference = [book, chapter && verse ? `${chapter}:${verse}` : chapter].filter(Boolean).join(' ');
    const reference = readString(
      record,
      ['reference', 'display_reference', 'verse_reference', 'ref', 'osis_ref', 'title'],
      computedReference || `Result ${index + 1}`,
    );
    const text = readString(record, ['headline', 'text', 'content', 'verseText', 'body', 'snippet']);
    const version = readString(record, ['version', 'version_abbr', 'version_id', 'translation']);

    return {
      body: text || undefined,
      id: readString(record, ['id', '_id', 'uuid'], `${reference}-${index}`),
      meta: readString(record, ['search_type', 'testament', 'language', 'language_code']) || undefined,
      subtitle: version || undefined,
      title: reference,
    };
  });

const normalizeSearchCredit = (payload: unknown): BibleChapterCredit | undefined => {
  const credit = asRecord(payload);

  if (Object.keys(credit).length === 0) {
    return undefined;
  }

  return {
    licenseNotes: readString(credit, ['license_notes']) || undefined,
    licenseType: readString(credit, ['license_type']) || undefined,
    licenseUrl: readString(credit, ['license_url']) || undefined,
    source: readString(credit, ['source']) || undefined,
    sourceUrl: readString(credit, ['source_url']) || undefined,
  };
};

const normalizeSuggestionList = (payload: unknown) =>
  Array.isArray(payload)
    ? payload
        .flatMap((item) => {
          if (typeof item === 'string') {
            return [item.trim()];
          }

          const record = asRecord(item);
          const directSuggestion = readString(record, ['text', 'query', 'suggestion', 'term']);
          const optionSuggestions = Array.isArray(record.options)
            ? record.options.map((option) => readString(asRecord(option), ['text', 'query', 'suggestion', 'term']))
            : [];

          return [directSuggestion, ...optionSuggestions];
        })
        .filter(Boolean)
    : [];

const normalizeSearchResult = (item: unknown, index: number): BibleSearchResult => {
  const record = asRecord(item);
  const bookRecord = asRecord(record.book);
  const bookName = readString(bookRecord, ['name', 'canonical_name']) || readString(record, ['book_name', 'book']);
  const bookOsisId = readString(bookRecord, ['osis_id', 'osisId']) || readString(record, ['book_osis_id', 'osis_book', 'book_id']);
  const chapter = readNumber(record, ['chapter', 'chapter_number'], 0) || undefined;
  const verseNumber = readNumber(record, ['verse_number', 'verse', 'number'], 0) || undefined;
  const computedReference = [bookName || bookOsisId, chapter && verseNumber ? `${chapter}:${verseNumber}` : chapter].filter(Boolean).join(' ');
  const reference = readString(
    record,
    ['reference', 'display_reference', 'verse_reference', 'ref', 'osis_ref', 'title'],
    computedReference || `Result ${index + 1}`,
  );
  const version = readString(record, ['version', 'version_abbr', 'version_id', 'translation']) || undefined;

  return {
    allTermsMatch: readBoolean(record, ['all_terms_match']),
    book: {
      name: bookName || undefined,
      osisId: bookOsisId || undefined,
    },
    chapter,
    credit: normalizeSearchCredit(record.credit),
    exactMatch: readBoolean(record, ['exact_match']),
    headline: readString(record, ['headline']) || undefined,
    id: readString(record, ['id', '_id', 'uuid'], `${reference}-${index}`),
    rank: readNumber(record, ['rank'], 0) || undefined,
    reference,
    searchType: readString(record, ['search_type']) || undefined,
    similarity: readNumber(record, ['similarity'], 0) || undefined,
    text: readString(record, ['text', 'content', 'verseText', 'body', 'snippet']) || undefined,
    verseNumber,
    version,
  };
};

export const normalizeSearchResponse = (payload: unknown): BibleSearchResponse => {
  const record = asRecord(payload);
  const results = unwrapCollection(payload).map(normalizeSearchResult);

  return {
    count: readNumber(record, ['count'], results.length),
    next: readString(record, ['next']) || null,
    previous: readString(record, ['previous']) || null,
    results,
    searchConfig: typeof record.search_config === 'string' ? record.search_config : asRecord(record.search_config),
    suggestions: normalizeSuggestionList(record.suggestions),
  };
};

export const normalizeComparisonResponse = (
  payload: unknown,
  requestedVersions: string[],
  fallbackBookId: string,
  fallbackChapter: number,
): BibleComparisonChapter => {
  const payloadRecord = asRecord(payload);
  const verseMap = new Map<number, BibleComparisonVerse>();
  const normalizedVersions = requestedVersions.map((version) => version.toLowerCase());
  const normalizeVersion = (version: string) => version.trim().toLowerCase();
  const isRequestedVersion = (version: string) => normalizedVersions.includes(normalizeVersion(version));
  const displayVersion = (version: string) =>
    requestedVersions.find((item) => normalizeVersion(item) === normalizeVersion(version)) || version;
  const addReading = (
    version: string,
    verseNumber: number,
    text: string,
    options: { display?: string; isPresent?: boolean } = {},
  ) => {
    if (!text && options.isPresent !== false) return;
    const existing = verseMap.get(verseNumber) || { readings: [], verseNumber };
    const normalizedVersion = displayVersion(version);
    const existingReading = existing.readings.find((reading) => normalizeVersion(reading.version) === normalizeVersion(normalizedVersion));
    const nextReading = {
      display: options.display,
      isPresent: options.isPresent,
      text,
      version: normalizedVersion,
    };

    if (existingReading) {
      Object.assign(existingReading, nextReading);
    } else {
      existing.readings.push(nextReading);
    }

    verseMap.set(verseNumber, existing);
  };
  const addReadingFromRecord = (version: string, verseNumber: number, record: UnknownRecord) => {
    const text = readString(record, ['text', 'content', 'verseText', 'body']);

    addReading(version, verseNumber, text, {
      display: readString(record, ['display']) || undefined,
      isPresent: readBoolean(record, ['is_present'], text ? true : undefined),
    });
  };
  const addVerseCollection = (version: string, collection: unknown[]) => {
    collection.forEach((item, index) => {
      const record = asRecord(item);
      const verseNumber = readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], index + 1);

      addReadingFromRecord(version, verseNumber, record);
    });
  };
  const readVersionFromRecord = (record: UnknownRecord) => {
    const directVersion = readString(record, ['version', 'version_abbr', 'version_id', 'translation', 'abbreviation', 'abbr', 'code']);

    if (directVersion) {
      return directVersion;
    }

    return readString(asRecord(record.version), ['abbreviation', 'abbr', 'code', 'version_abbr', 'id', 'name']);
  };
  const addReadingsObject = (verseNumber: number, value: unknown) => {
    Object.entries(asRecord(value)).forEach(([version, textValue]) => {
      if (!isRequestedVersion(version)) return;

      if (typeof textValue === 'string' || typeof textValue === 'number') {
        addReading(version, verseNumber, String(textValue));
        return;
      }

      addReadingFromRecord(version, verseNumber, asRecord(textValue));
    });
  };
  const addReadingsArray = (verseNumber: number, collection: unknown[]) => {
    collection.forEach((item) => {
      const record = asRecord(item);
      const version = readVersionFromRecord(record);

      if (version && isRequestedVersion(version)) {
        addReadingFromRecord(version, verseNumber, record);
      }
    });
  };
  const addVerseRow = (item: unknown, index: number) => {
    const record = asRecord(item);
    const verseNumber = readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], index + 1);

    requestedVersions.forEach((version) => {
      addReading(version, verseNumber, readString(record, [version, version.toLowerCase()]));
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

    if (version) {
      addReadingFromRecord(version, verseNumber, record);
    }
  };
  const addVersionPayload = (version: string, value: unknown) => {
    if (!isRequestedVersion(version)) return;

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

    addReadingFromRecord(version, readNumber(record, ['verse_number', 'number', 'verse', 'verseNumber', 'order'], 1), record);
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

  requestedVersions.forEach((version) => {
    addVersionPayload(version, payloadRecord[version]);
  });

  return {
    book: readString(payloadRecord, ['book', 'book_id', 'book_name']) || readString(asRecord(payloadRecord.book), ['name', 'osis_id', 'abbreviation'], fallbackBookId),
    chapter: readNumber(payloadRecord, ['chapter', 'chapter_number'], fallbackChapter),
    verses: Array.from(verseMap.values()).sort((left, right) => left.verseNumber - right.verseNumber),
    versions: requestedVersions,
  };
};
