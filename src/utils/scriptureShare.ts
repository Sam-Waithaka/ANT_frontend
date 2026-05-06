import type { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../types/scripture';

const SCRIPTURE_SHARE_BASE_URL = 'https://aicnjoro.org/scripture';

type ShareReferenceOptions = {
  book?: BibleBook;
  chapter?: BibleChapter;
  chapterVerses?: BibleVerse[];
  verse?: BibleVerse;
  version?: BibleVersion;
};

const getVersionValue = (version?: BibleVersion) => version?.abbreviation || version?.id || '';

export const buildScriptureShareLink = ({
  book,
  chapter,
  verse,
  version,
}: ShareReferenceOptions) => {
  const params = new URLSearchParams();

  if (book?.name) {
    params.set('book', book.name);
  }

  if (chapter?.number) {
    params.set('chapter', String(chapter.number));
  }

  if (verse?.number) {
    params.set('verse', String(verse.number));
  }

  const versionValue = getVersionValue(version);
  if (versionValue) {
    params.set('version', versionValue);
  }

  const query = params.toString();
  return query ? `${SCRIPTURE_SHARE_BASE_URL}?${query}` : SCRIPTURE_SHARE_BASE_URL;
};

export const buildVerseShareText = ({
  book,
  chapter,
  verse,
  version,
}: ShareReferenceOptions) => {
  if (!book || !chapter || !verse) {
    return '';
  }

  const reference = `${book.name} ${chapter.number}:${verse.number}`;
  const versionValue = getVersionValue(version);
  const versionSuffix = versionValue ? ` (${versionValue})` : '';
  const link = buildScriptureShareLink({ book, chapter, verse, version });

  return `${reference}${versionSuffix}\n\n${verse.text}\n\nRead on AIC Njoro Town:\n${link}`;
};

export const buildChapterShareText = ({
  book,
  chapter,
  chapterVerses = [],
  version,
}: ShareReferenceOptions) => {
  if (!book || !chapter) {
    return '';
  }

  const reference = `${book.name} ${chapter.number}`;
  const versionValue = getVersionValue(version);
  const versionSuffix = versionValue ? ` (${versionValue})` : '';
  const link = buildScriptureShareLink({ book, chapter, version });
  const chapterText = chapterVerses.map((item) => `${item.number}. ${item.text}`).join('\n');

  return `${reference}${versionSuffix}\n\n${chapterText}\n\nRead this chapter on AIC Njoro Town:\n${link}`;
};
