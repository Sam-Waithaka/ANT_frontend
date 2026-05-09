export type BibleVersion = {
  description?: string;
  id: string;
  isPublic?: boolean;
  language?: string;
  languageCode?: string;
  licenseNotes?: string;
  licenseType?: string;
  licenseUrl?: string;
  name: string;
  abbreviation?: string;
  publicationYear?: number;
  source?: string;
  sourceUrl?: string;
};

export type BibleBook = {
  abbreviation?: string;
  canonicalAbbreviation?: string;
  canonicalName?: string;
  id: string;
  longName?: string;
  name: string;
  number?: number;
  testament?: 'old' | 'new';
};

export type BibleChapter = {
  id: string;
  number: number;
  label: string;
};

export type BibleVerse = {
  annotations?: BibleVerseAnnotation[];
  chapterCredit?: BibleChapterCredit;
  crossReferences?: BibleChapterNote[];
  display?: string;
  footnotes?: BibleChapterNote[];
  id: string;
  number: number;
  text: string;
  isPresent?: boolean;
  markers?: BibleVerseMarker[];
  notes?: BibleChapterNote[];
};

export type BibleVerseMarker = {
  note?: string;
  status: BibleMarkerStatus | string;
};

export type BibleVerseAnnotation = {
  anchorText?: string;
  content: string;
  endOffset?: number;
  id: string;
  placement?: string;
  rawContent?: string;
  sourceMarker?: string;
  startOffset?: number;
  type: string;
  verseNumber?: number;
};

export type BibleChapterCredit = {
  licenseNotes?: string;
  licenseType?: string;
  licenseUrl?: string;
  source?: string;
  sourceUrl?: string;
};

export type BibleChapterNote = {
  id: string;
  verseNumber?: number;
  type: BibleNoteType;
  text: string;
  reference?: string;
};

export type ScriptureSelection = {
  versionId: string;
  bookId: string;
  chapterId: string;
};

export type ScriptureReferenceIntent = {
  book: string;
  chapter: number;
  verse?: number;
  verses?: number[];
  versionId?: string;
};

export type ScriptureRenderRequest = {
  book?: string;
  bookId?: string;
  chapter?: number;
  chapterId?: string;
  chapterPlacement?: 'first' | 'last';
  verse?: number | null;
  verses?: number[];
  versionId?: string;
};

export type BibleResourceType =
  | 'preface'
  | 'copyright'
  | 'study_help'
  | 'translation_review'
  | 'glossary'
  | 'front_matter'
  | 'other';

export type BibleMarkerStatus = 'omitted' | 'empty_marker' | 'source_unavailable';

export type BibleNoteType = 'footnote' | 'cross_reference' | 'textual_variant';
export type BookFilter = 'both' | 'old' | 'new';

export type BibleToolRecord = {
  id: string;
  title: string;
  subtitle?: string;
  body?: string;
  meta?: string;
};

export type BibleSearchBook = {
  name?: string;
  osisId?: string;
};

export type BibleSearchConfig = Record<string, unknown>;

export type BibleSearchResult = {
  allTermsMatch?: boolean;
  book: BibleSearchBook;
  chapter?: number;
  credit?: BibleChapterCredit;
  exactMatch?: boolean;
  headline?: string;
  id: string;
  rank?: number;
  reference: string;
  searchType?: string;
  similarity?: number;
  text?: string;
  verseNumber?: number;
  version?: string;
};

export type BibleSearchResponse = PaginatedResponse<BibleSearchResult> & {
  searchConfig?: BibleSearchConfig;
  suggestions: string[];
};

export type BibleComparisonReading = {
  text: string;
  version: string;
};

export type BibleComparisonVerse = {
  readings: BibleComparisonReading[];
  verseNumber: number;
};

export type BibleComparisonChapter = {
  book: string;
  chapter: number;
  versions: string[];
  verses: BibleComparisonVerse[];
};

export type VerseLookupResult = {
  reference: string;
  text: string;
  isPresent: boolean;
  display?: string;
  footnotes?: unknown[];
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
