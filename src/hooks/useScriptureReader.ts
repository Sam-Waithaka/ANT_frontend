import { useEffect, useMemo, useState } from 'react';
import { useScriptureReaderContext } from '../contexts/ScriptureReaderContext';
import {
  getBibleBooks,
  getBibleChapters,
  getBibleVersions,
  getBibleVerses,
  getBibleVersesByReference,
} from '../services/scriptureApi';
import type { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../types/scripture';
import { normalizeReferenceValue } from '../utils/scriptureReference';
import { findBookIdForIntent, findChapterIdForIntent } from '../utils/scriptureIntent';

const DEFAULT_VERSION_ABBR = 'BSB';

export const useScriptureReader = () => {
  const {
    pendingReference,
    selectedBookId,
    selectedChapterId,
    selectedVersionId,
    clearPendingReference,
    setSelectedBookId,
    setSelectedChapterId,
    setSelectedVersionId,
  } = useScriptureReaderContext();
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [chapters, setChapters] = useState<BibleChapter[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loadedReferenceKey, setLoadedReferenceKey] = useState('');
  const [loading, setLoading] = useState({
    versions: true,
    books: false,
    chapters: false,
    verses: false,
  });
  const [error, setError] = useState('');

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId),
    [selectedVersionId, versions],
  );
  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId),
    [books, selectedBookId],
  );
  const selectedChapter = useMemo(
    () =>
      chapters.find(
        (chapter) =>
          chapter.id === selectedChapterId ||
          String(chapter.number) === selectedChapterId ||
          selectedChapterId.endsWith(`.${chapter.number}`),
      ),
    [chapters, selectedChapterId],
  );
  const selectedChapterIndex = chapters.findIndex(
    (chapter) => chapter.id === selectedChapterId,
  );
  const selectedBookIndex = books.findIndex((book) => book.id === selectedBookId);
  const canGoPrevious = selectedChapterIndex > 0 || (selectedChapterIndex === 0 && selectedBookIndex > 0);
  const canGoNext =
    (selectedChapterIndex >= 0 && selectedChapterIndex < chapters.length - 1) ||
    (selectedChapterIndex === chapters.length - 1 &&
      selectedBookIndex >= 0 &&
      selectedBookIndex < books.length - 1);
  const pendingBookMatch = pendingReference
    ? books.find((book) => {
        const requested = normalizeReferenceValue(pendingReference.book);
        return (
          normalizeReferenceValue(book.id) === requested ||
          normalizeReferenceValue(book.name) === requested ||
          normalizeReferenceValue(book.abbreviation || '') === requested
        );
      })
    : undefined;
  const pendingChapterMatch = pendingReference
    ? chapters.find((chapter) => chapter.number === pendingReference.chapter)
    : undefined;
  const isResolvingReference = Boolean(pendingReference);
  const displayPassageTitle = pendingReference
    ? `${pendingReference.book} ${pendingReference.chapter}`
    : selectedBook && selectedChapter
      ? `${selectedBook.name} ${selectedChapter.number}`
      : 'Scripture';
  const currentReferenceKey =
    selectedVersionId && selectedBook && selectedChapter
      ? `${selectedVersionId}:${normalizeReferenceValue(selectedBook.name)}:${selectedChapter.number}`
      : '';
  const pendingReferenceKey =
    pendingReference && selectedVersionId
      ? `${selectedVersionId}:${normalizeReferenceValue(pendingReference.book)}:${pendingReference.chapter}`
      : '';

  useEffect(() => {
    if (!pendingReference || books.length === 0) {
      return;
    }

    const requestedBookId = findBookIdForIntent(books, pendingReference);

    if (requestedBookId && requestedBookId !== selectedBookId) {
      setSelectedBookId(requestedBookId);
    }
  }, [books, pendingReference, selectedBookId, setSelectedBookId]);

  useEffect(() => {
    if (!pendingReference || chapters.length === 0) {
      return;
    }

    const requestedChapterId = findChapterIdForIntent(chapters, pendingReference);

    if (requestedChapterId && requestedChapterId !== selectedChapterId) {
      setSelectedChapterId(requestedChapterId);
    }
  }, [chapters, pendingReference, selectedChapterId, setSelectedChapterId]);

  useEffect(() => {
    let cancelled = false;

    const loadVersions = async () => {
      setLoading((current) => ({ ...current, versions: true }));
      setError('');

      try {
        const nextVersions = await getBibleVersions();
        if (cancelled) return;

        setVersions(nextVersions);
        setSelectedVersionId((current) => {
          const defaultVersion = nextVersions.find(
            (version) =>
              normalizeReferenceValue(version.id) === normalizeReferenceValue(DEFAULT_VERSION_ABBR) ||
              normalizeReferenceValue(version.abbreviation || '') ===
                normalizeReferenceValue(DEFAULT_VERSION_ABBR),
          );

          return current || defaultVersion?.id || nextVersions[0]?.id || '';
        });
      } catch {
        if (!cancelled) {
          setError('We could not load Bible versions. Please check the Scripture API connection.');
        }
      } finally {
        if (!cancelled) {
          setLoading((current) => ({ ...current, versions: false }));
        }
      }
    };

    loadVersions();

    return () => {
      cancelled = true;
    };
  }, [setSelectedVersionId]);

  useEffect(() => {
    if (!selectedVersionId) return;

    let cancelled = false;

    const loadBooks = async () => {
      setLoading((current) => ({ ...current, books: true }));
      setError('');

      try {
        const nextBooks = await getBibleBooks(selectedVersionId);
        if (cancelled) return;

        setBooks(nextBooks);
        setSelectedBookId((current) => {
          if (nextBooks.some((book) => book.id === current)) {
            return current;
          }

          const requestedBookId = findBookIdForIntent(nextBooks, pendingReference);

          return requestedBookId || nextBooks[0]?.id || '';
        });
      } catch {
        if (!cancelled) {
          setError('We could not load Bible books for this version.');
        }
      } finally {
        if (!cancelled) {
          setLoading((current) => ({ ...current, books: false }));
        }
      }
    };

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, [pendingReference, selectedVersionId, setSelectedBookId]);

  useEffect(() => {
    if (!selectedVersionId || !selectedBookId) return;

    let cancelled = false;

    const loadChapters = async () => {
      setLoading((current) => ({ ...current, chapters: true }));
      setError('');

      try {
        const nextChapters = await getBibleChapters(selectedVersionId, selectedBookId);
        if (cancelled) return;

        setChapters(nextChapters);
        setSelectedChapterId((current) => {
          const match = nextChapters.find(
            (chapter) =>
              chapter.id === current ||
              String(chapter.number) === current ||
              current.endsWith(`.${chapter.number}`),
          );

          if (match) {
            return match.id;
          }

          const requestedChapterId = findChapterIdForIntent(nextChapters, pendingReference);

          return requestedChapterId || nextChapters[0]?.id || '';
        });
      } catch {
        if (!cancelled) {
          setError('We could not load chapters for this book.');
        }
      } finally {
        if (!cancelled) {
          setLoading((current) => ({ ...current, chapters: false }));
        }
      }
    };

    loadChapters();

    return () => {
      cancelled = true;
    };
  }, [pendingReference, selectedBookId, selectedVersionId, setSelectedChapterId]);

  useEffect(() => {
    if (!pendingReference || !selectedVersionId || loadedReferenceKey === pendingReferenceKey) {
      return;
    }

    let cancelled = false;

    const loadPendingVerses = async () => {
      setLoading((current) => ({ ...current, verses: true }));
      setError('');

      try {
        const nextVerses = await getBibleVersesByReference(
          selectedVersionId,
          pendingReference.book,
          pendingReference.chapter,
        );
        if (!cancelled) {
          setVerses(nextVerses);
          setLoadedReferenceKey(pendingReferenceKey);
        }
      } catch {
        if (!cancelled) {
          setError('We could not load verses for this chapter.');
        }
      } finally {
        if (!cancelled) {
          setLoading((current) => ({ ...current, verses: false }));
        }
      }
    };

    loadPendingVerses();

    return () => {
      cancelled = true;
    };
  }, [loadedReferenceKey, pendingReference, pendingReferenceKey, selectedVersionId]);

  useEffect(() => {
    if (!selectedVersionId || !selectedBookId || !selectedChapter || pendingReference) return;
    if (loadedReferenceKey === currentReferenceKey) return;

    let cancelled = false;

    const loadVerses = async () => {
      setLoading((current) => ({ ...current, verses: true }));
      setError('');

      try {
        const nextVerses = await getBibleVerses(
          selectedVersionId,
          selectedBookId,
          selectedChapter.id,
          selectedChapter.number,
        );
        if (!cancelled) {
          setVerses(nextVerses);
          setLoadedReferenceKey(currentReferenceKey);
        }
      } catch {
        if (!cancelled) {
          setError('We could not load verses for this chapter.');
        }
      } finally {
        if (!cancelled) {
          setLoading((current) => ({ ...current, verses: false }));
        }
      }
    };

    loadVerses();

    return () => {
      cancelled = true;
    };
  }, [
    currentReferenceKey,
    loadedReferenceKey,
    selectedBookId,
    selectedChapter,
    selectedVersionId,
  ]);

  useEffect(() => {
    if (
      pendingReference &&
      pendingBookMatch?.id === selectedBookId &&
      pendingChapterMatch?.id === selectedChapter?.id &&
      loadedReferenceKey === pendingReferenceKey
    ) {
      clearPendingReference();
    }
  }, [
    clearPendingReference,
    loadedReferenceKey,
    pendingBookMatch?.id,
    pendingChapterMatch?.id,
    pendingReference,
    pendingReferenceKey,
    selectedBookId,
    selectedChapter?.id,
  ]);

  useEffect(() => {
    if (!pendingReference || !selectedBookId || !selectedChapterId) {
      return;
    }

    const requestedBookId = findBookIdForIntent(books, pendingReference);
    const requestedChapterId = findChapterIdForIntent(chapters, pendingReference);

    if (
      requestedBookId === selectedBookId &&
      requestedChapterId &&
      requestedChapterId !== selectedChapterId
    ) {
      setSelectedChapterId(requestedChapterId);
    }
  }, [
    books,
    chapters,
    pendingReference,
    selectedBookId,
    selectedChapterId,
    setSelectedChapterId,
  ]);

  const goToPreviousChapter = () => {
    if (selectedChapterIndex > 0) {
      setSelectedChapterId(chapters[selectedChapterIndex - 1].id);
      return;
    }

    if (selectedChapterIndex === 0 && selectedBookIndex > 0) {
      setSelectedBookId(books[selectedBookIndex - 1].id);
      setSelectedChapterId('');
    }
  };

  const goToNextChapter = () => {
    if (selectedChapterIndex >= 0 && selectedChapterIndex < chapters.length - 1) {
      setSelectedChapterId(chapters[selectedChapterIndex + 1].id);
      return;
    }

    if (
      selectedChapterIndex === chapters.length - 1 &&
      selectedBookIndex >= 0 &&
      selectedBookIndex < books.length - 1
    ) {
      setSelectedBookId(books[selectedBookIndex + 1].id);
      setSelectedChapterId('');
    }
  };

  return {
    books,
    canGoNext,
    canGoPrevious,
    chapters,
    error,
    displayPassageTitle,
    isResolvingReference,
    loading,
    selectedBook,
    selectedBookId,
    selectedChapter,
    selectedChapterId,
    selectedChapterIndex,
    selectedVersion,
    selectedVersionId,
    versions,
    verses,
    goToNextChapter,
    goToPreviousChapter,
    setSelectedBookId,
    setSelectedChapterId,
    setSelectedVersionId,
  };
};
