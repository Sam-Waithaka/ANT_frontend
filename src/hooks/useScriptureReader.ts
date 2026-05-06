import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { parseVerseSelection } from '../utils/scriptureShare';

const DEFAULT_VERSION_ABBR = 'BSB';

export const useScriptureReader = () => {
  const {
    pendingReference,
    openReference,
    selectedVerseNumber,
    selectedBookId,
    selectedChapterId,
    selectedVersionId,
    clearPendingReference,
    setSelectedVerseNumber,
    setSelectedBookId,
    setSelectedChapterId,
    setSelectedVersionId,
  } = useScriptureReaderContext();
  const [searchParams] = useSearchParams();
  const lastUrlReferenceKey = useRef('');
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
    const book = searchParams.get('book');
    const chapterValue = Number(searchParams.get('chapter'));
    const verseValue = Number(searchParams.get('verse'));
    const selectedVerses = parseVerseSelection(searchParams.get('verses'));
    const versionId = searchParams.get('version') || undefined;

    if (!book || !Number.isFinite(chapterValue) || chapterValue <= 0) {
      return;
    }

    const nextKey = [book, chapterValue, versionId || '', Number.isFinite(verseValue) ? verseValue : '']
      .map((value) => String(value))
      .join('|');

    if (lastUrlReferenceKey.current === nextKey) {
      return;
    }

    lastUrlReferenceKey.current = nextKey;
    openReference({
      book,
      chapter: chapterValue,
      verse:
        selectedVerses[0] ||
        (Number.isFinite(verseValue) && verseValue > 0 ? verseValue : undefined),
      verses: selectedVerses.length > 0 ? selectedVerses : undefined,
      versionId,
    });
  }, [openReference, searchParams]);

  useEffect(() => {
    const requestedBook = searchParams.get('book');
    const requestedChapter = Number(searchParams.get('chapter'));

    if (!requestedBook || !Number.isFinite(requestedChapter) || requestedChapter <= 0) {
      return;
    }

    const requestedBookId = books.find(
      (book) =>
        normalizeReferenceValue(book.id) === normalizeReferenceValue(requestedBook) ||
        normalizeReferenceValue(book.name) === normalizeReferenceValue(requestedBook) ||
        normalizeReferenceValue(book.abbreviation || '') === normalizeReferenceValue(requestedBook),
    )?.id;

    if (requestedBookId && requestedBookId !== selectedBookId) {
      setSelectedBookId(requestedBookId);
      return;
    }

    const requestedChapterId = chapters.find((chapter) => chapter.number === requestedChapter)?.id;
    if (requestedChapterId && requestedChapterId !== selectedChapterId) {
      setSelectedChapterId(requestedChapterId);
    }
  }, [
    books,
    chapters,
    searchParams,
    selectedBookId,
    selectedChapterId,
    setSelectedBookId,
    setSelectedChapterId,
  ]);

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
    selectedVerseNumber,
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
    setSelectedVerseNumber,
    setSelectedVersionId,
  };
};
