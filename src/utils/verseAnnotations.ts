import type { BibleVerseAnnotation } from '../types/scripture';

export type VerseAnnotationNote = {
  annotations: BibleVerseAnnotation[];
  id: string;
  label: number;
  offset?: number;
};

export type VerseAnnotationSegment = {
  markerLabels?: number[];
  text: string;
};

export type VerseAnnotationView = {
  inlineNotes: VerseAnnotationNote[];
  verseNumberNotes: VerseAnnotationNote[];
  segments: VerseAnnotationSegment[];
};

type BuildVerseAnnotationViewOptions = {
  includeRawContent?: boolean;
};

const hasReadableContent = (annotation: BibleVerseAnnotation) => annotation.content.trim().length > 0;
const withoutRawContent = ({ rawContent: _rawContent, ...annotation }: BibleVerseAnnotation): BibleVerseAnnotation => annotation;
export const annotationIdentityKey = (annotation: BibleVerseAnnotation) =>
  [
    annotation.type,
    annotation.verseNumber || '',
    annotation.startOffset ?? '',
    annotation.endOffset ?? '',
    annotation.sourceMarker || '',
    annotation.anchorText || '',
    annotation.content,
  ].join('|').toLowerCase();

const dedupeAnnotations = (annotations: BibleVerseAnnotation[]) => {
  const seen = new Set<string>();

  return annotations.filter((annotation) => {
    const key = annotationIdentityKey(annotation);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const isWordCharacter = (value: string) => /[\p{L}\p{N}'’-]/u.test(value);

const snapInsideWordToWordEnd = (offset: number, text: string) => {
  if (
    offset <= 0 ||
    offset >= text.length ||
    !isWordCharacter(text[offset - 1] || '') ||
    !isWordCharacter(text[offset] || '')
  ) {
    return offset;
  }

  let nextOffset = offset;

  while (nextOffset < text.length && isWordCharacter(text[nextOffset] || '')) {
    nextOffset += 1;
  }

  return nextOffset;
};

const offsetFor = (annotation: BibleVerseAnnotation, text: string) => {
  const offset = annotation.endOffset ?? annotation.startOffset;

  if (offset === undefined || !Number.isFinite(offset)) {
    return undefined;
  }

  return snapInsideWordToWordEnd(Math.max(0, Math.min(offset, text.length)), text);
};

const groupByOffset = (annotations: BibleVerseAnnotation[], text: string) => {
  const grouped = new Map<number, BibleVerseAnnotation[]>();
  const missingOffset: BibleVerseAnnotation[] = [];

  dedupeAnnotations(annotations.filter(hasReadableContent)).forEach((annotation) => {
    const offset = offsetFor(annotation, text);

    if (offset === undefined) {
      missingOffset.push(annotation);
      return;
    }

    grouped.set(offset, [...(grouped.get(offset) || []), annotation]);
  });

  return {
    grouped,
    missingOffset,
  };
};

export const buildVerseAnnotationView = (
  text: string,
  annotations: BibleVerseAnnotation[] = [],
  options: BuildVerseAnnotationViewOptions = {},
): VerseAnnotationView => {
  // Keep rich annotation placement separate from rendering so Study Mode can opt in without making the default reader noisy.
  const { grouped, missingOffset } = groupByOffset(annotations, text);
  const sortedOffsets = Array.from(grouped.keys()).sort((left, right) => left - right);
  const offsetLabels = new Map<number, number>();
  const inlineNotes: VerseAnnotationNote[] = [];
  const verseNumberNotes: VerseAnnotationNote[] = [];
  const prepareAnnotation = options.includeRawContent ? (annotation: BibleVerseAnnotation) => annotation : withoutRawContent;

  sortedOffsets.forEach((offset) => {
    const label = inlineNotes.length + 1;
    const groupedAnnotations = (grouped.get(offset) || []).map(prepareAnnotation);

    offsetLabels.set(offset, label);
    inlineNotes.push({
      annotations: groupedAnnotations,
      id: `offset-${offset}`,
      label,
      offset,
    });
  });

  missingOffset.forEach((annotation) => {
    const existing = verseNumberNotes.find((note) => note.annotations.some((item) => item.id === annotation.id));

    if (!existing) {
      verseNumberNotes.push({
        annotations: [prepareAnnotation(annotation)],
        id: `verse-${annotation.id}`,
        label: inlineNotes.length + verseNumberNotes.length + 1,
      });
    }
  });

  if (sortedOffsets.length === 0) {
    return {
      inlineNotes,
      segments: [{ text }],
      verseNumberNotes,
    };
  }

  const segments: VerseAnnotationSegment[] = [];
  let cursor = 0;

  sortedOffsets.forEach((offset) => {
    if (offset > cursor) {
      segments.push({ text: text.slice(cursor, offset) });
    }

    const label = offsetLabels.get(offset);
    segments.push({
      markerLabels: label ? [label] : undefined,
      text: '',
    });
    cursor = offset;
  });

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return {
    inlineNotes,
    segments,
    verseNumberNotes,
  };
};
