import { createContext, useContext, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { ScriptureReferenceIntent, ScriptureRenderRequest } from '../types/scripture';

const DEFAULT_VERSION_ABBR = 'BSB';

type ScriptureReaderContextType = {
  pendingReference: ScriptureReferenceIntent | null;
  selectedVerseNumber: number | null;
  selectedBookId: string;
  selectedChapterId: string;
  selectedVersionId: string;
  clearPendingReference: () => void;
  setSelectedVerseNumber: Dispatch<SetStateAction<number | null>>;
  openScripture: (request: ScriptureRenderRequest) => void;
  setSelectedBookId: Dispatch<SetStateAction<string>>;
  setSelectedChapterId: Dispatch<SetStateAction<string>>;
  setSelectedVersionId: Dispatch<SetStateAction<string>>;
};

const ScriptureReaderContext = createContext<ScriptureReaderContextType | undefined>(undefined);

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
        const { book, bookId, chapter, chapterId, verse, versionId } = request;

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
          setSelectedChapterIdState(chapterId || '');
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

export const useScriptureReaderContext = () => {
  const context = useContext(ScriptureReaderContext);

  if (!context) {
    throw new Error('useScriptureReaderContext must be used within a ScriptureReaderProvider');
  }

  return context;
};
