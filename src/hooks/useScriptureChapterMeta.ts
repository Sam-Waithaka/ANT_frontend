import { useMemo } from 'react';
import type { BibleChapterCredit, BibleChapterNote, BibleNoteType, BibleVerse, BibleVerseAnnotation } from '../types/scripture';

const dedupeNotes = (notes: BibleChapterNote[]) =>
  notes.filter((note, index, allNotes) =>
    allNotes.findIndex((candidate) =>
      candidate.type === note.type &&
      candidate.verseNumber === note.verseNumber &&
      candidate.text === note.text &&
      candidate.reference === note.reference
    ) === index,
  );

const annotationNoteType = (annotation: BibleVerseAnnotation): BibleNoteType | null => {
  if (annotation.type === 'cross_reference') return 'cross_reference';
  if (annotation.type === 'textual_variant') return 'textual_variant';
  if (annotation.type === 'footnote' || annotation.type === 'word_study' || annotation.type === 'translator_addition') {
    return 'footnote';
  }

  return null;
};

const notesFromAnnotations = (verse: BibleVerse) =>
  (verse.annotations || [])
    .map((annotation): BibleChapterNote | null => {
      const type = annotationNoteType(annotation);

      if (!type || !annotation.content) {
        return null;
      }

      return {
        id: annotation.id,
        reference: annotation.anchorText,
        text: annotation.content,
        type,
        verseNumber: annotation.verseNumber || verse.number,
      };
    })
    .filter(Boolean) as BibleChapterNote[];

export const useScriptureChapterMeta = (verses: BibleVerse[]) =>
  useMemo(() => {
    const scriptureVerses = verses.filter((verse) => verse.number > 0);
    const annotationNotes = scriptureVerses.flatMap(notesFromAnnotations);
    const footnotes = dedupeNotes(scriptureVerses.flatMap((verse) =>
      [...notesFromAnnotations(verse), ...(verse.notes || [])]
        .filter((note) => note.type === 'footnote')
        .map((note) => ({ ...note, verseNumber: note.verseNumber || verse.number })),
    ));
    const crossReferences = dedupeNotes(verses.flatMap((verse) =>
      [...notesFromAnnotations(verse), ...(verse.notes || [])]
        .filter((note) => note.type === 'cross_reference')
        .map((note) => ({ ...note, verseNumber: note.verseNumber || verse.number })),
    ));
    const licenseNote = verses
      .flatMap((verse) => verse.notes || [])
      .find((note) => note.reference === 'license');
    const chapterCredit = verses.find((verse) => verse.chapterCredit)?.chapterCredit as BibleChapterCredit | undefined;

    return {
      chapterCredit,
      annotationNotes,
      crossReferences,
      footnotes,
      licenseNote,
      scriptureVerses,
    };
  }, [verses]);
