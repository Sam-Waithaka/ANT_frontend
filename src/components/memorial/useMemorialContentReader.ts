import { useCallback, useRef, useState, type ReactNode } from "react";

export type MemorialContentReaderEntry = {
  actionLabel?: string;
  eyebrow?: string;
  fullContent: ReactNode;
  id: number | string;
  image?: ReactNode;
  preview: ReactNode;
  readingMeta?: string;
  subtitle?: string;
  title: string;
};

export function useMemorialContentReader<TEntry extends MemorialContentReaderEntry = MemorialContentReaderEntry>() {
  const [activeEntry, setActiveEntry] = useState<TEntry | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openReader = useCallback((entry: TEntry, trigger?: HTMLElement | null) => {
    returnFocusRef.current = trigger ?? null;
    setActiveEntry(entry);
  }, []);

  const closeReader = useCallback(() => {
    setActiveEntry(null);

    window.setTimeout(() => {
      if (returnFocusRef.current?.isConnected) {
        returnFocusRef.current.focus();
      }
      returnFocusRef.current = null;
    }, 0);
  }, []);

  return {
    activeEntry,
    closeReader,
    isReaderOpen: Boolean(activeEntry),
    openReader,
  };
}