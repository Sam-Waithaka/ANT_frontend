import { createContext, useContext, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { ScriptureReferenceIntent } from '../types/scripture';

const DEFAULT_VERSION_ABBR = 'BSB';

type ScriptureReaderContextType = {
  pendingReference: ScriptureReferenceIntent | null;
  selectedVerseNumber: number | null;
  selectedBookId: string;
  selectedChapterId: string;
  selectedVersionId: string;
  clearPendingReference: () => void;
  setSelectedVerseNumber: Dispatch<SetStateAction<number | null>>;
  openReference: (reference: ScriptureReferenceIntent) => void;
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
      openReference: (reference) => {
        setPendingReference(reference);
        setSelectedVersionIdState(reference.versionId || selectedVersionId || DEFAULT_VERSION_ABBR);
        setSelectedVerseNumber(reference.verse ?? null);
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
