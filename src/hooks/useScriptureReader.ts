import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBibleBooks, getBibleChapters, getBibleVersions, getBibleVerses } from '../services/scriptureApi';
import type { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../types/scripture';
import { normalizeReferenceValue } from '../utils/scriptureReference';

const DEFAULT_VERSION_ABBR = 'BSB';

export const useScriptureReader = () => {
  const [searchParams] = useSearchParams();
  const initialReference = useMemo(() => {
    return {
      book: searchParams.get('book') || '',
      chapter: Number(searchParams.get('chapter') || 0),
      version: searchParams.get('version') || '',
    };
  }, [searchParams]);
  const hasAppliedInitialBook = useRef(false);
  const hasAppliedInitialChapter = useRef(false);
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [chapters, setChapters] = useState<BibleChapter[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [loading, setLoading] = useState({ versions: true, books: false, chapters: false, verses: false });
  const [error, setError] = useState('');

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId),
    [selectedVersionId, versions],
  );
  const selectedBook = useMemo(() => books.find((book) => book.id === selectedBookId), [books, selectedBookId]);
  const selectedChapter = useMemo(
    () => chapters.find(
      (chapter) =>
        chapter.id === selectedChapterId ||
        String(chapter.number) === selectedChapterId ||
        selectedChapterId.endsWith(`.${chapter.number}`)
    ),
    [chapters, selectedChapterId],
  );
  const selectedChapterIndex = chapters.findIndex((chapter) => chapter.id === selectedChapterId);
  const selectedBookIndex = books.findIndex((book) => book.id === selectedBookId);
  const canGoPrevious =
    selectedChapterIndex > 0 ||
    (selectedChapterIndex === 0 && selectedBookIndex > 0);
  const canGoNext =
    (selectedChapterIndex >= 0 && selectedChapterIndex < chapters.length - 1) ||
    (selectedChapterIndex === chapters.length - 1 && selectedBookIndex >= 0 && selectedBookIndex < books.length - 1);

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
          const requestedVersion = nextVersions.find((version) =>
            normalizeReferenceValue(version.id) === normalizeReferenceValue(initialReference.version) ||
            normalizeReferenceValue(version.abbreviation || '') === normalizeReferenceValue(initialReference.version),
          );
          const defaultVersion = nextVersions.find((version) =>
            normalizeReferenceValue(version.id) === normalizeReferenceValue(DEFAULT_VERSION_ABBR) ||
            normalizeReferenceValue(version.abbreviation || '') === normalizeReferenceValue(DEFAULT_VERSION_ABBR),
          );

          return requestedVersion?.id || current || defaultVersion?.id || nextVersions[0]?.id || '';
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
  }, [initialReference.version]);

  useEffect(() => {
    if (!selectedVersionId) return;

    let cancelled = false;

    const loadBooks = async () => {
      setLoading((current) => ({ ...current, books: true }));
      setError('');
      setBooks([]);
      setChapters([]);
      setVerses([]);

      try {
        const nextBooks = await getBibleBooks(selectedVersionId);
        if (cancelled) return;

        setBooks(nextBooks);
        setSelectedBookId((current) => {
          if (initialReference.book && !hasAppliedInitialBook.current) {
            const requestedBook = nextBooks.find((book) => {
              const requested = normalizeReferenceValue(initialReference.book);

              return (
                normalizeReferenceValue(book.id) === requested ||
                normalizeReferenceValue(book.name) === requested ||
                normalizeReferenceValue(book.abbreviation || '') === requested
              );
            });

            if (requestedBook) {
              hasAppliedInitialBook.current = true;
              return requestedBook.id;
            }
          }

          return nextBooks.some((book) => book.id === current) ? current : nextBooks[0]?.id || '';
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
  }, [initialReference.book, selectedVersionId]);

  useEffect(() => {
    if (!selectedVersionId || !selectedBookId) return;

    let cancelled = false;

    const loadChapters = async () => {
      setLoading((current) => ({ ...current, chapters: true }));
      setError('');
      setChapters([]);
      setVerses([]);

      try {
        const nextChapters = await getBibleChapters(selectedVersionId, selectedBookId);
        if (cancelled) return;

        setChapters(nextChapters);
        setSelectedChapterId((current) => {
          if (initialReference.chapter && !hasAppliedInitialChapter.current) {
            const requestedChapter = nextChapters.find((chapter) => chapter.number === initialReference.chapter);

            if (requestedChapter) {
              hasAppliedInitialChapter.current = true;
              return requestedChapter.id;
            }
          }

          const match = nextChapters.find((chapter) =>
            chapter.id === current ||
            String(chapter.number) === current ||
            current.endsWith(`.${chapter.number}`)
          );

          return match ? match.id : nextChapters[0]?.id || '';
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
  }, [initialReference.chapter, selectedBookId, selectedVersionId]);

  useEffect(() => {
    if (!selectedVersionId || !selectedBookId || !selectedChapter) return;

    let cancelled = false;

    const loadVerses = async () => {
      setLoading((current) => ({ ...current, verses: true }));
      setError('');
      setVerses([]);

      try {
        const nextVerses = await getBibleVerses(
          selectedVersionId,
          selectedBookId,
          selectedChapter.id,
          selectedChapter.number,
        );
        if (!cancelled) {
          setVerses(nextVerses);
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
  }, [selectedBookId, selectedChapter, selectedVersionId]);

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

    if (selectedChapterIndex === chapters.length - 1 && selectedBookIndex >= 0 && selectedBookIndex < books.length - 1) {
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
