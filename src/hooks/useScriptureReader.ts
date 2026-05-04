import { useEffect, useMemo, useState } from 'react';
import { getBibleBooks, getBibleChapters, getBibleVersions, getBibleVerses } from '../services/scriptureApi';
import type { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../types/scripture';

export const useScriptureReader = () => {
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
    () => chapters.find((chapter) => chapter.id === selectedChapterId),
    [chapters, selectedChapterId],
  );
  const selectedChapterIndex = chapters.findIndex((chapter) => chapter.id === selectedChapterId);

  useEffect(() => {
    let cancelled = false;

    const loadVersions = async () => {
      setLoading((current) => ({ ...current, versions: true }));
      setError('');

      try {
        const nextVersions = await getBibleVersions();
        if (cancelled) return;

        setVersions(nextVersions);
        setSelectedVersionId((current) => current || nextVersions[0]?.id || '');
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
  }, []);

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
        setSelectedBookId((current) => (nextBooks.some((book) => book.id === current) ? current : nextBooks[0]?.id || ''));
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
  }, [selectedVersionId]);

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
        setSelectedChapterId((current) =>
          nextChapters.some((chapter) => chapter.id === current) ? current : nextChapters[0]?.id || '',
        );
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
  }, [selectedBookId, selectedVersionId]);

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
    }
  };

  const goToNextChapter = () => {
    if (selectedChapterIndex >= 0 && selectedChapterIndex < chapters.length - 1) {
      setSelectedChapterId(chapters[selectedChapterIndex + 1].id);
    }
  };

  return {
    books,
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
