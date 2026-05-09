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

const hasReadableContent = (annotation: BibleVerseAnnotation) => annotation.content.trim().length > 0;
const withoutRawContent = ({ rawContent: _rawContent, ...annotation }: BibleVerseAnnotation): BibleVerseAnnotation => annotation;

const offsetFor = (annotation: BibleVerseAnnotation, textLength: number) => {
  const offset = annotation.endOffset ?? annotation.startOffset;

  if (offset === undefined || !Number.isFinite(offset)) {
    return undefined;
  }

  return Math.max(0, Math.min(offset, textLength));
};

const groupByOffset = (annotations: BibleVerseAnnotation[], textLength: number) => {
  const grouped = new Map<number, BibleVerseAnnotation[]>();
  const missingOffset: BibleVerseAnnotation[] = [];

  annotations.filter(hasReadableContent).forEach((annotation) => {
    const offset = offsetFor(annotation, textLength);

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
): VerseAnnotationView => {
  // Keep rich annotation placement separate from rendering so Study Mode can opt in without making the default reader noisy.
  const { grouped, missingOffset } = groupByOffset(annotations, text.length);
  const sortedOffsets = Array.from(grouped.keys()).sort((left, right) => left - right);
  const offsetLabels = new Map<number, number>();
  const inlineNotes: VerseAnnotationNote[] = [];
  const verseNumberNotes: VerseAnnotationNote[] = [];

  sortedOffsets.forEach((offset) => {
    const label = inlineNotes.length + 1;
    const groupedAnnotations = (grouped.get(offset) || []).map(withoutRawContent);

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
        annotations: [withoutRawContent(annotation)],
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
