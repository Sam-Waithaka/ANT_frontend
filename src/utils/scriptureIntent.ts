import type { BibleBook, BibleChapter, ScriptureReferenceIntent } from '../types/scripture';
import { normalizeReferenceValue } from './scriptureReference';

export const findBookIdForIntent = (
  books: BibleBook[],
  intent: ScriptureReferenceIntent | null,
) => {
  if (!intent) {
    return '';
  }

  const requested = normalizeReferenceValue(intent.book);
  const requestedBook = books.find(
    (book) =>
      normalizeReferenceValue(book.id) === requested ||
      normalizeReferenceValue(book.name) === requested ||
      normalizeReferenceValue(book.abbreviation || '') === requested,
  );

  return requestedBook?.id || '';
};

export const findChapterIdForIntent = (
  chapters: BibleChapter[],
  intent: ScriptureReferenceIntent | null,
) => {
  if (!intent) {
    return '';
  }

  const requestedChapter = chapters.find(
    (chapter) => chapter.number === intent.chapter,
  );

  return requestedChapter?.id || '';
};
