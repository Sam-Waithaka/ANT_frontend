export type BibleVersion = {
  id: string;
  name: string;
  abbreviation?: string;
};

export type BibleBook = {
  abbreviation?: string;
  id: string;
  name: string;
  testament?: 'old' | 'new';
};

export type BibleChapter = {
  id: string;
  number: number;
  label: string;
};

export type BibleVerse = {
  id: string;
  number: number;
  text: string;
  isPresent?: boolean;
  notes?: BibleChapterNote[];
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
