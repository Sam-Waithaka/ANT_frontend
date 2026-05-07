export type BibleVersion = {
  id: string;
  name: string;
  abbreviation?: string;
  code?: string;
  language?: string;
  languageCode?: string;
  licenseType?: string;
  publicationYear?: number;
  source?: string;
  isPublic?: boolean;
};

export type BibleVersionDetail = BibleVersion & {
  description?: string;
  licenseNotes?: string;
  licenseUrl?: string;
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
  osisId?: string;
  testament?: 'old' | 'new';
};

export type BibleChapter = {
  id: string;
  number: number;
  label: string;
};

export type BibleVerse = {
  display?: string;
  footnotes?: BibleChapterNote[];
  id: string;
  number: number;
  text: string;
  isPresent?: boolean;
  markers?: BibleMarker[];
  notes?: BibleChapterNote[];
  rawAnnotations?: BibleAnnotation[];
};

export type BibleChapterNote = {
  anchorText?: string;
  endOffset?: number;
  id: string;
  verseNumber?: number;
  type: BibleNoteType;
  placement?: string;
  text: string;
  rawContent?: string;
  reference?: string;
  sourceMarker?: string;
  startOffset?: number;
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

export type BibleNoteType =
  | 'footnote'
  | 'cross_reference'
  | 'textual_variant'
  | 'section_heading'
  | 'paragraph'
  | 'poetry'
  | 'speaker_label'
  | 'translator_addition'
  | 'word_study'
  | 'other';
export type BookFilter = 'both' | 'old' | 'new';

export type BibleCredit = {
  licenseNotes?: string;
  licenseType?: string;
  source?: string;
  sourceUrl?: string;
};

export type BibleMarker = {
  note?: string;
  status?: BibleMarkerStatus | string;
};

export type BibleAnnotation = {
  anchorText?: string;
  content: string;
  endOffset?: number;
  id: string;
  placement?: string;
  rawContent?: string;
  sourceMarker?: string;
  startOffset?: number;
  type: BibleNoteType;
  verseNumber?: number;
};

export type BibleChapterDetail = {
  book: BibleBook;
  chapter: number;
  credit?: BibleCredit;
  version: BibleVersion;
  verses: BibleVerse[];
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type BibleToolRecord = {
  id: string;
  title: string;
  subtitle?: string;
  body?: string;
  meta?: string;
};

export type BibleComparisonReading = {
  display?: string;
  isPresent?: boolean;
  markerNote?: string;
  text: string;
  version: string;
};

export type BibleComparisonVerse = {
  readings: BibleComparisonReading[];
  verseNumber: number;
};

export type BibleComparisonChapter = {
  book: string;
  bookId?: string;
  chapter: number;
  versions: string[];
  verses: BibleComparisonVerse[];
};

export type BibleSearchResult = BibleToolRecord & {
  bookId?: string;
  chapter?: number;
  credit?: BibleCredit;
  headline?: string;
  isFuzzy?: boolean;
  reference: string;
  searchType?: string;
  testament?: string;
  verseNumber?: number;
  version?: string;
};

export type BibleToken = {
  endOffset?: number;
  lemma?: string;
  morphology?: string;
  normalized?: string;
  position?: number;
  startOffset?: number;
  strong?: string;
  token: string;
  tokenType?: string;
};

export type BibleResource = {
  id: string;
  content?: string;
  resourceType?: BibleResourceType | string;
  title: string;
};

export type BibleGlossaryEntry = {
  definition: string;
  id: string;
  term: string;
};

export type BibleSourceRecord = {
  cleanText?: string;
  rawText?: string;
  sourceFile?: string;
  sourceFormat?: string;
  sourceId?: string;
};

export type VerseLookupResult = {
  reference: string;
  text: string;
  isPresent: boolean;
  display?: string;
  footnotes?: unknown[];
};
