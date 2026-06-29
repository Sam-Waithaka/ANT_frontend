export type ScriptureDisplay = 'inline' | 'block' | 'passage';
export type ScriptureSource = 'api' | 'manual';

export type ScriptureVerse = {
  number: number;
  text: string;
};

export type ScriptureData = {
  book_osis?: string;
  bookLabel?: string;
  chapter_start?: number;
  verse_start?: number;
  chapter_end?: number | null;
  verse_end?: number | null;
  display_text?: string;
  scriptureReferenceId?: number | string;
  display: ScriptureDisplay;
  reference: string;
  source: ScriptureSource;
  sourceId?: string;
  text: string;
  version: string;
  verses?: ScriptureVerse[];
};

