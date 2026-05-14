import type { AudioVisualItem } from '../../../types/audioVisual';
import { bookNames, normalizeReferenceValue } from '../../../utils/scriptureReference';

export type ParsedScriptureReference = {
  book: string;
  chapter: number;
  display: string;
  endVerse?: number;
  startVerse?: number;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const scripturePattern = new RegExp(
  `\\b(${bookNames.map(escapeRegExp).join('|')})\\s+(\\d+)(?::\\s*(\\d+)(?:\\s*[-\\u2013\\u2014]\\s*(\\d+))?)?`,
  'gi'
);

const cleanDisplay = (value: string) =>
  value
    .replace(/\s+/g, ' ')
    .replace(/[.:;,]+$/g, '')
    .trim();

const canonicalBookName = (value: string) =>
  bookNames.find((book) => normalizeReferenceValue(book) === normalizeReferenceValue(value)) || cleanDisplay(value);

export const getPlayableMediaUrl = (item: AudioVisualItem | null | undefined) =>
  item?.embedUrl || item?.externalUrl || '';

export const parseScriptureReferences = (value?: string): ParsedScriptureReference[] => {
  if (!value?.trim()) return [];

  const references: ParsedScriptureReference[] = [];
  const seen = new Set<string>();
  const source = cleanDisplay(value);
  let match: RegExpExecArray | null;

  scripturePattern.lastIndex = 0;

  while ((match = scripturePattern.exec(source)) !== null) {
    const book = canonicalBookName(match[1]);
    const chapter = Number(match[2]);
    const startVerse = match[3] ? Number(match[3]) : undefined;
    const endVerse = match[4] ? Number(match[4]) : startVerse;

    if (!book || !Number.isFinite(chapter) || chapter <= 0) {
      continue;
    }

    const key = `${normalizeReferenceValue(book)}:${chapter}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    references.push({
      book,
      chapter,
      display: `${book} ${chapter}`,
      endVerse,
      startVerse,
    });
  }

  return references;
};

export const toScriptureSlug = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '-');

export const createScriptureUrl = (reference: ParsedScriptureReference, returnTo?: string) => {
  const params = new URLSearchParams({
    book: toScriptureSlug(reference.book),
    chapter: String(reference.chapter),
  });

  if (returnTo) {
    params.set('returnTo', returnTo);
  }

  return `/scripture?${params.toString()}`;
};
