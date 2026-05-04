import { useMemo } from 'react';
import type { BibleChapterNote, BibleVerse } from '../types/scripture';

const dedupeNotes = (notes: BibleChapterNote[]) =>
  notes.filter((note, index, allNotes) =>
    allNotes.findIndex((candidate) =>
      candidate.type === note.type &&
      candidate.verseNumber === note.verseNumber &&
      candidate.text === note.text &&
      candidate.reference === note.reference
    ) === index,
  );

export const useScriptureChapterMeta = (verses: BibleVerse[]) =>
  useMemo(() => {
    const scriptureVerses = verses.filter((verse) => verse.number > 0);
    const footnotes = dedupeNotes(scriptureVerses.flatMap((verse) =>
      (verse.notes || [])
        .filter((note) => note.type === 'footnote')
        .map((note) => ({ ...note, verseNumber: note.verseNumber || verse.number })),
    ));
    const crossReferences = dedupeNotes(verses.flatMap((verse) =>
      (verse.notes || [])
        .filter((note) => note.type === 'cross_reference')
        .map((note) => ({ ...note, verseNumber: note.verseNumber || verse.number })),
    ));
    const licenseNote = verses
      .flatMap((verse) => verse.notes || [])
      .find((note) => note.reference === 'license');

    return {
      crossReferences,
      footnotes,
      licenseNote,
      scriptureVerses,
    };
  }, [verses]);
