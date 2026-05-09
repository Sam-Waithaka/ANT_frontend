import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useScriptureReaderContext } from '../contexts/ScriptureReaderStore';
import {
  getBibleAnnotations,
  getBibleBooks,
  getBibleChapters,
  getBibleVersions,
  getBibleVerses,
  getBibleVersesByReference,
} from '../services/scriptureApi';
import type { BibleBook, BibleChapter, BibleVerse, BibleVerseAnnotation, BibleVersion } from '../types/scripture';
import { normalizeReferenceValue } from '../utils/scriptureReference';
import { findBookIdForIntent, findChapterIdForIntent } from '../utils/scriptureIntent';
import { parseVerseSelection } from '../utils/scriptureShare';

const DEFAULT_VERSION_ABBR = 'BSB';

const mergeAnnotationsIntoVerses = (
  verses: BibleVerse[],
  annotations: BibleVerseAnnotation[],
) => {
  if (annotations.length === 0) {
    return verses;
  }

  const annotationsByVerse = new Map<number, BibleVerseAnnotation[]>();

  annotations.forEach((annotation) => {
    const verseNumber = annotation.verseNumber;
    if (!verseNumber) return;

    annotationsByVerse.set(verseNumber, [...(annotationsByVerse.get(verseNumber) || []), annotation]);
  });

  return verses.map((verse) => {
    const nextAnnotations = annotationsByVerse.get(verse.number) || [];

    if (nextAnnotations.length === 0) {
      return verse;
    }

    const existingIds = new Set((verse.annotations || []).map((annotation) => annotation.id));

    return {
      ...verse,
      annotations: [
        ...(verse.annotations || []),
        ...nextAnnotations.filter((annotation) => !existingIds.has(annotation.id)),
      ],
    };
  });
};

const loadVerseAnnotations = async (versionId: string, bookId: string, chapterNumber: number) => {
  try {
    return await getBibleAnnotations(versionId, bookId, chapterNumber);
  } catch {
    return [];
  }
};

export const useScriptureReader = () => {
  const {
    pendingReference,
    openScripture,
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
  const activeVerseReferenceKey = useRef('');
  const readerMounted = useRef(true);
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
      ? `${selectedVersionId}:${normalizeReferenceValue(selectedBook.id)}:${selectedChapter.number}`
      : '';
  const pendingReferenceKey =
    pendingReference && selectedVersionId
      ? `${selectedVersionId}:${normalizeReferenceValue(pendingReference.book)}:${pendingReference.chapter}`
      : '';

  useEffect(() => {
    readerMounted.current = true;

    return () => {
      readerMounted.current = false;
    };
  }, []);

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
    openScripture({
      book,
      chapter: chapterValue,
      verse:
        selectedVerses[0] ||
        (Number.isFinite(verseValue) && verseValue > 0 ? verseValue : undefined),
      verses: selectedVerses.length > 0 ? selectedVerses : undefined,
      versionId,
    });
  }, [openScripture, searchParams]);

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
          if (current === '__last__') {
            return nextChapters.at(-1)?.id || '';
          }

          if (current === '__first__') {
            return nextChapters[0]?.id || '';
          }

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
      activeVerseReferenceKey.current = pendingReferenceKey;
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
        void loadVerseAnnotations(
          selectedVersionId,
          pendingBookMatch?.id || pendingReference.book,
          pendingReference.chapter,
        ).then((nextAnnotations) => {
          if (
            readerMounted.current &&
            activeVerseReferenceKey.current === pendingReferenceKey &&
            nextAnnotations.length > 0
          ) {
            setVerses((current) => mergeAnnotationsIntoVerses(current, nextAnnotations));
          }
        });
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
  }, [loadedReferenceKey, pendingBookMatch, pendingReference, pendingReferenceKey, selectedVersionId]);

  useEffect(() => {
    if (!selectedVersionId || !selectedBookId || !selectedChapter || pendingReference) return;
    if (loadedReferenceKey === currentReferenceKey) return;

    let cancelled = false;

    const loadVerses = async () => {
      activeVerseReferenceKey.current = currentReferenceKey;
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
        void loadVerseAnnotations(
          selectedVersionId,
          selectedBookId,
          selectedChapter.number,
        ).then((nextAnnotations) => {
          if (
            readerMounted.current &&
            activeVerseReferenceKey.current === currentReferenceKey &&
            nextAnnotations.length > 0
          ) {
            setVerses((current) => mergeAnnotationsIntoVerses(current, nextAnnotations));
          }
        });
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
    pendingReference,
    selectedBookId,
    selectedChapter,
    selectedVersionId,
  ]);

  useEffect(() => {
    if (
      pendingReference &&
      pendingBookMatch &&
      pendingChapterMatch &&
      loadedReferenceKey === pendingReferenceKey
    ) {
      setSelectedBookId(pendingBookMatch.id);
      setSelectedChapterId(pendingChapterMatch.id);
      clearPendingReference();
    }
  }, [
    clearPendingReference,
    loadedReferenceKey,
    pendingBookMatch,
    pendingChapterMatch,
    pendingReference,
    pendingReferenceKey,
    setSelectedBookId,
    setSelectedChapterId,
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
      openScripture({ chapterId: chapters[selectedChapterIndex - 1].id });
      return;
    }

    if (selectedChapterIndex === 0 && selectedBookIndex > 0) {
      openScripture({ bookId: books[selectedBookIndex - 1].id, chapterPlacement: 'last' });
    }
  };

  const goToNextChapter = () => {
    if (selectedChapterIndex >= 0 && selectedChapterIndex < chapters.length - 1) {
      openScripture({ chapterId: chapters[selectedChapterIndex + 1].id });
      return;
    }

    if (
      selectedChapterIndex === chapters.length - 1 &&
      selectedBookIndex >= 0 &&
      selectedBookIndex < books.length - 1
    ) {
      openScripture({ bookId: books[selectedBookIndex + 1].id, chapterPlacement: 'first' });
    }
  };

  const openSelectedBook = (bookId: string) => {
    openScripture({ bookId });
  };

  const openSelectedChapter = (chapterId: string) => {
    openScripture({ chapterId });
  };

  const openSelectedVersion = (versionId: string) => {
    openScripture({ versionId });
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
    openScripture,
    setSelectedBookId: openSelectedBook,
    setSelectedChapterId: openSelectedChapter,
    setSelectedVerseNumber,
    setSelectedVersionId: openSelectedVersion,
  };
};
