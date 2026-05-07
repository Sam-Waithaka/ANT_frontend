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

const normalizeVerseNumbers = (numbers: number[]) =>
  [...new Set(numbers.filter((number) => Number.isFinite(number) && number > 0))].sort(
    (left, right) => left - right,
  );

export const formatVerseNumbers = (verses: BibleVerse[] | number[]) => {
  const numbers = normalizeVerseNumbers(
    typeof verses[0] === 'number'
      ? (verses as number[])
      : (verses as BibleVerse[]).map((verse) => verse.number),
  );

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

export const parseVerseSelection = (value: string | null | undefined) => {
  if (!value) {
    return [];
  }

  const numbers = value
    .split(',')
    .flatMap((segment) => {
      const trimmed = segment.trim();

      if (!trimmed) {
        return [];
      }

      const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const start = Number(rangeMatch[1]);
        const end = Number(rangeMatch[2]);
        const lower = Math.min(start, end);
        const upper = Math.max(start, end);

        return Array.from({ length: upper - lower + 1 }, (_, index) => lower + index);
      }

      const number = Number(trimmed);
      return Number.isFinite(number) && number > 0 ? [number] : [];
    });

  return normalizeVerseNumbers(numbers);
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
  verses,
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

  const verseSelection = verses?.length
    ? formatVerseNumbers(verses)
    : verse?.number
      ? String(verse.number)
      : '';

  if (verseSelection) {
    params.set('verses', verseSelection);
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
  const url = buildScriptureShareLink({ book, chapter, verses: sortedVerses, version });
  const selectionText = sortedVerses.map((verse) => `${verse.number}. ${verse.text}`).join('\n');
  const title = `${reference}${versionSuffix}`;

  return {
    title,
    text: `${selectionText}\n\n${reference}${versionSuffix}`,
    url,
    copyText: `${title}\n\n${selectionText}\n\nRead on AIC Njoro Town:\n${url}`,
  };
};
