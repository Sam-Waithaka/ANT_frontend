import { useEffect, useState } from 'react';
import { compareBibleChapter, getBibleChapters } from '../services/scriptureApi';
import type { BibleBook, BibleChapter, BibleComparisonChapter, BibleVersion } from '../types/scripture';

type LoadComparisonOptions = {
  bookId?: string;
  chapterNumber?: number;
  highlightedVerseNumbers?: number[];
  openModal?: boolean;
  versionIds?: string[];
};

type UseBibleComparisonOptions = {
  books: BibleBook[];
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  versions: BibleVersion[];
};

export const useBibleComparison = ({
  books,
  selectedBook,
  selectedChapter,
  selectedVersion,
  versions,
}: UseBibleComparisonOptions) => {
  const [bookId, setBookId] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapters, setChapters] = useState<BibleChapter[]>([]);
  const [comparison, setComparison] = useState<BibleComparisonChapter | null>(null);
  const [highlightedVerseNumbers, setHighlightedVerseNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [versionIds, setVersionIds] = useState<string[]>([]);
  const versionId = selectedVersion?.id || versions[0]?.id || '';
  const selectedVersions = versionIds.filter((id) => versions.some((version) => version.id === id));
  const defaultVersions = [
    selectedVersion?.id || versionId,
    versions.find((version) => version.id !== (selectedVersion?.id || versionId))?.id,
  ].filter(Boolean) as string[];
  const compareBook = books.find((book) => book.id === bookId);
  const compareChapter = chapters.find((chapter) => chapter.number === chapterNumber);
  const comparisonHasVerses = Boolean(comparison?.verses.length);
  const versionLabelFor = (versionIdToFind: string) =>
    versions.find((version) => version.id.toLowerCase() === versionIdToFind.toLowerCase())?.abbreviation || versionIdToFind;

  useEffect(() => {
    if (versions.length === 0 || versionIds.length > 0 || defaultVersions.length === 0) {
      return;
    }

    setVersionIds(defaultVersions.length >= 2 ? defaultVersions : versions.slice(0, 2).map((version) => version.id));
  }, [defaultVersions, versionIds.length, versions]);

  useEffect(() => {
    if (selectedBook?.id) {
      setBookId(selectedBook.id);
    }
  }, [selectedBook?.id]);

  useEffect(() => {
    if (selectedChapter?.number) {
      setChapterNumber(selectedChapter.number);
    }
  }, [selectedChapter?.number]);

  useEffect(() => {
    if (!versionId || !bookId) return;

    let cancelled = false;

    const loadChapters = async () => {
      try {
        const nextChapters = await getBibleChapters(versionId, bookId);
        if (!cancelled) {
          setChapters(nextChapters);
          setChapterNumber((current) =>
            nextChapters.some((chapter) => chapter.number === current) ? current : nextChapters[0]?.number || 1,
          );
        }
      } catch {
        if (!cancelled) {
          setChapters([]);
        }
      }
    };

    loadChapters();

    return () => {
      cancelled = true;
    };
  }, [bookId, versionId]);

  const resetOutput = () => {
    setComparison(null);
    setOpen(false);
    setStatus('');
  };

  const toggleVersion = (versionIdToToggle: string) => {
    setVersionIds((current) =>
      current.includes(versionIdToToggle)
        ? current.filter((id) => id !== versionIdToToggle)
        : [...current, versionIdToToggle],
    );
  };

  const loadComparison = async ({
    bookId: nextBookId = bookId || selectedBook?.id || 'John',
    chapterNumber: nextChapterNumber = chapterNumber || selectedChapter?.number || 1,
    highlightedVerseNumbers: nextHighlightedVerseNumbers = highlightedVerseNumbers,
    openModal = open,
    versionIds: nextVersionIds = selectedVersions,
  }: LoadComparisonOptions = {}) => {
    if (nextVersionIds.length < 2) {
      setStatus('Choose at least two Bible versions to compare.');
      return null;
    }

    setLoading(true);
    setStatus('');

    try {
      const nextComparison = await compareBibleChapter(nextVersionIds, nextBookId, nextChapterNumber);
      setBookId(nextBookId);
      setChapterNumber(nextComparison.chapter || nextChapterNumber);
      setComparison(nextComparison);
      setHighlightedVerseNumbers(nextHighlightedVerseNumbers);
      setOpen(openModal && nextComparison.verses.length > 0);

      if (nextComparison.verses.length === 0) {
        setStatus('No comparison text was returned for this chapter. Try another version pair or confirm the compare endpoint response shape.');
      }

      return nextComparison;
    } catch {
      setStatus('Unable to load this comparison right now.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const changeVersions = async (nextVersionIds: string[]) => {
    if (nextVersionIds.length === 0) {
      return;
    }

    setVersionIds(nextVersionIds);

    if (open) {
      await loadComparison({ versionIds: nextVersionIds });
    }
  };

  const changeReference = async ({
    bookId: nextBookId,
    chapterNumber: nextChapterNumber,
  }: {
    bookId: string;
    chapterNumber: number;
  }) => {
    let nextChapters = chapters;

    if (nextBookId !== bookId || nextChapters.length === 0) {
      try {
        nextChapters = await getBibleChapters(versionId, nextBookId);
        setChapters(nextChapters);
      } catch {
        setStatus('Unable to load chapters for that book right now.');
        return;
      }
    }

    const usableChapterNumber = nextChapters.some((chapter) => chapter.number === nextChapterNumber)
      ? nextChapterNumber
      : nextChapters[0]?.number || nextChapterNumber;

    await loadComparison({
      bookId: nextBookId,
      chapterNumber: usableChapterNumber,
      highlightedVerseNumbers: [],
      openModal: true,
    });
  };

  return {
    bookId,
    chapterNumber,
    chapters,
    compareBook,
    compareChapter,
    comparison,
    comparisonHasVerses,
    highlightedVerseNumbers,
    loading,
    open,
    selectedVersions,
    status,
    versionIds,
    changeReference,
    changeVersions,
    loadComparison,
    resetOutput,
    setBookId,
    setChapterNumber,
    setOpen,
    setStatus,
    toggleVersion,
    versionLabelFor,
  };
};
