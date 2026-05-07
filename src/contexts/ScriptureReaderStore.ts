import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ScriptureReferenceIntent, ScriptureRenderRequest } from '../types/scripture';

export type ScriptureReaderContextType = {
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

export const ScriptureReaderContext = createContext<ScriptureReaderContextType | undefined>(undefined);

export const useScriptureReaderContext = () => {
  const context = useContext(ScriptureReaderContext);

  if (!context) {
    throw new Error('useScriptureReaderContext must be used within a ScriptureReaderProvider');
  }

  return context;
};
