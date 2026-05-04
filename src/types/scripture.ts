export type BibleVersion = {
  id: string;
  name: string;
  abbreviation?: string;
};

export type BibleBook = {
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
};

export type ScriptureSelection = {
  versionId: string;
  bookId: string;
  chapterId: string;
};
