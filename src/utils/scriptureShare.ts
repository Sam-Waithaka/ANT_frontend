import type { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../types/scripture';

const FALLBACK_PUBLIC_SITE_URL = 'https://aicnjoro.org';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

type ShareReferenceOptions = {
  book?: BibleBook;
  chapter?: BibleChapter;
  chapterVerses?: BibleVerse[];
  verses?: BibleVerse[];
  verse?: BibleVerse;
  version?: BibleVersion;
};

export type ScriptureSharePayload = {
  copyText: string;
  text: string;
  title: string;
  url: string;
};

const getVersionValue = (version?: BibleVersion) => version?.abbreviation || version?.id || '';

const formatVerseNumbers = (verses: BibleVerse[]) => {
  const numbers = [...new Set(verses.map((verse) => verse.number).sort((left, right) => left - right))];

  if (numbers.length === 0) {
    return '';
  }

  const ranges: string[] = [];
  let rangeStart = numbers[0];
  let previous = numbers[0];

  for (let index = 1; index <= numbers.length; index += 1) {
    const current = numbers[index];

    if (current === previous + 1) {
      previous = current;
      continue;
    }

    ranges.push(rangeStart === previous ? String(rangeStart) : `${rangeStart}-${previous}`);
    rangeStart = current;
    previous = current;
  }

  return ranges.join(', ');
};

const getPublicSiteUrl = () => {
  const configuredUrl = (import.meta.env as ImportMeta['env'] & { VITE_PUBLIC_SITE_URL?: string })
    .VITE_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const { hostname, origin } = window.location;

    if (!LOCAL_HOSTNAMES.has(hostname)) {
      return origin.replace(/\/+$/, '');
    }
  }

  return FALLBACK_PUBLIC_SITE_URL;
};

const getScriptureShareBaseUrl = () => `${getPublicSiteUrl()}/scripture`;

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
  const baseUrl = getScriptureShareBaseUrl();
  return query ? `${baseUrl}?${query}` : baseUrl;
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

export const buildVerseSharePayload = ({
  book,
  chapter,
  verse,
  version,
}: ShareReferenceOptions): ScriptureSharePayload | null => {
  if (!book || !chapter || !verse) {
    return null;
  }

  const reference = `${book.name} ${chapter.number}:${verse.number}`;
  const versionValue = getVersionValue(version);
  const versionSuffix = versionValue ? ` (${versionValue})` : '';
  const url = buildScriptureShareLink({ book, chapter, verse, version });
  const title = `${reference}${versionSuffix}`;
  const text = `${verse.text}\n\n${reference}${versionSuffix}`;

  return {
    title,
    text,
    url,
    copyText: `${title}\n\n${verse.text}\n\nRead on AIC Njoro Town:\n${url}`,
  };
};

export const buildChapterSharePayload = ({
  book,
  chapter,
  chapterVerses = [],
  version,
}: ShareReferenceOptions): ScriptureSharePayload | null => {
  if (!book || !chapter) {
    return null;
  }

  const reference = `${book.name} ${chapter.number}`;
  const versionValue = getVersionValue(version);
  const versionSuffix = versionValue ? ` (${versionValue})` : '';
  const url = buildScriptureShareLink({ book, chapter, version });
  const chapterText = chapterVerses.map((item) => `${item.number}. ${item.text}`).join('\n');
  const title = `${reference}${versionSuffix}`;

  return {
    title,
    text: `${reference}${versionSuffix}\n\n${chapterText}`,
    url,
    copyText: `${reference}${versionSuffix}\n\n${chapterText}\n\nRead this chapter on AIC Njoro Town:\n${url}`,
  };
};

export const buildSelectionSharePayload = ({
  book,
  chapter,
  verses = [],
  version,
}: ShareReferenceOptions): ScriptureSharePayload | null => {
  if (!book || !chapter || verses.length === 0) {
    return null;
  }

  const sortedVerses = [...verses].sort((left, right) => left.number - right.number);
  const verseLabel = formatVerseNumbers(sortedVerses);
  const reference = `${book.name} ${chapter.number}:${verseLabel}`;
  const versionValue = getVersionValue(version);
  const versionSuffix = versionValue ? ` (${versionValue})` : '';
  const firstVerse = sortedVerses[0];
  const url = buildScriptureShareLink({ book, chapter, verse: firstVerse, version });
  const selectionText = sortedVerses.map((verse) => `${verse.number}. ${verse.text}`).join('\n');
  const title = `${reference}${versionSuffix}`;

  return {
    title,
    text: `${selectionText}\n\n${reference}${versionSuffix}`,
    url,
    copyText: `${title}\n\n${selectionText}\n\nRead on AIC Njoro Town:\n${url}`,
  };
};
