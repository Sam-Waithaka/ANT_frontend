import type { AudioVisualItem } from '../../../types/audioVisual';

export type ParsedScriptureReference = {
  book: string;
  chapter: number;
  display: string;
  verse?: number;
};

const scripturePattern = /^([1-3]?\s?[A-Za-z ]+?)\s+(\d+)(?::(\d+)(?:[-–]\d+)?)?/;

export const getPlayableMediaUrl = (item: AudioVisualItem | null | undefined) =>
  item?.embedUrl || item?.externalUrl || '';

export const parseScriptureReferences = (value?: string): ParsedScriptureReference[] => {
  if (!value?.trim()) return [];

  return value
    .split(/[,;]+/)
    .map((part) => part.trim())
    .map((part) => {
      const match = part.match(scripturePattern);

      if (!match) return null;

      return {
        book: match[1].trim(),
        chapter: Number(match[2]),
        display: part,
        verse: match[3] ? Number(match[3]) : undefined,
      };
    })
    .filter(Boolean) as ParsedScriptureReference[];
};

export const toScriptureSlug = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '-');

export const createScriptureUrl = (reference: ParsedScriptureReference, includeVerse = true) => {
  const params = new URLSearchParams({
    book: toScriptureSlug(reference.book),
    chapter: String(reference.chapter),
  });

  if (includeVerse && reference.verse) {
    params.set('verse', String(reference.verse));
  }

  return `/scripture?${params.toString()}`;
};
