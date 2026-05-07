import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ScriptureReferenceIntent } from '../types/scripture';
import {
  ScriptureReaderContext,
  type ScriptureReaderContextType,
} from './ScriptureReaderStore';

const DEFAULT_VERSION_ABBR = 'BSB';

export const ScriptureReaderProvider = ({ children }: { children: ReactNode }) => {
  const [selectedVersionId, setSelectedVersionIdState] = useState(DEFAULT_VERSION_ABBR);
  const [selectedBookId, setSelectedBookIdState] = useState('');
  const [selectedChapterId, setSelectedChapterIdState] = useState('');
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [pendingReference, setPendingReference] = useState<ScriptureReferenceIntent | null>(null);

  const value = useMemo<ScriptureReaderContextType>(
    () => ({
      pendingReference,
      selectedVerseNumber,
      selectedBookId,
      selectedChapterId,
      selectedVersionId,
      clearPendingReference: () => setPendingReference(null),
      openScripture: (request) => {
        const { book, bookId, chapter, chapterId, chapterPlacement, verse, versionId } = request;

        if (versionId) {
          setSelectedVersionIdState(versionId);
        }

        if (book && chapter) {
          setPendingReference({ book, chapter, verse: verse ?? undefined, versionId });
          setSelectedVerseNumber(verse ?? null);
          return;
        }

        setPendingReference(null);

        if (bookId) {
          setSelectedBookIdState(bookId);
          setSelectedChapterIdState(
            chapterId ||
              (chapterPlacement === 'last' ? '__last__' : chapterPlacement === 'first' ? '__first__' : ''),
          );
        } else if (chapterId) {
          setSelectedChapterIdState(chapterId);
        }

        setSelectedVerseNumber(verse ?? null);
      },
      setSelectedVerseNumber,
      setSelectedBookId: (value) => {
        setSelectedBookIdState(value);
      },
      setSelectedChapterId: (value) => {
        setSelectedChapterIdState(value);
      },
      setSelectedVersionId: (value) => {
        setSelectedVersionIdState(value);
      },
    }),
    [pendingReference, selectedVerseNumber, selectedBookId, selectedChapterId, selectedVersionId],
  );

  return <ScriptureReaderContext.Provider value={value}>{children}</ScriptureReaderContext.Provider>;
};
