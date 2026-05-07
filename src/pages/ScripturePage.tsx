import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScriptureActionSheet from '../components/scripture/ScriptureActionSheet';
import ScriptureBooksRail from '../components/scripture/ScriptureBooksRail';
import ScriptureComparisonModal from '../components/scripture/ScriptureComparisonModal';
import ScriptureCompactControls from '../components/scripture/ScriptureCompactControls';
import ScriptureDisplay from '../components/scripture/ScriptureDisplay';
import ScriptureFloatingControls from '../components/scripture/ScriptureFloatingControls';
import ScriptureMobilePanels from '../components/scripture/ScriptureMobilePanels';
import ScriptureReaderTopBar from '../components/scripture/ScriptureReaderTopBar';
import ScriptureSidePanel from '../components/scripture/ScriptureSidePanel';
import SiteHeader from '../components/SiteHeader';
import SiteSideNav from '../components/SiteSideNav';
import { useScriptureChapterMeta } from '../hooks/useScriptureChapterMeta';
import { useScriptureReader } from '../hooks/useScriptureReader';
import { useScriptureSearch } from '../hooks/useScriptureSearch';
import { useCompactHeader } from '../hooks/useCompactHeader';
import { useTheme } from '../hooks/useTheme';
import { compareBibleChapter, getBibleChapters } from '../services/scriptureApi';
import type { BibleChapter, BibleComparisonChapter, BibleVerse } from '../types/scripture';
import {
  buildChapterSharePayload,
  buildSelectionSharePayload,
  buildVerseSharePayload,
  parseVerseSelection,
} from '../utils/scriptureShare';
import { normalizeReferenceValue } from '../utils/scriptureReference';

const ScripturePage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [forceSearchBarOpen, setForceSearchBarOpen] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<BibleVerse[]>([]);
  const [focusVerseNumber, setFocusVerseNumber] = useState<number | null>(null);
  const [comparison, setComparison] = useState<BibleComparisonChapter | null>(null);
  const [comparisonHighlightedVerseNumbers, setComparisonHighlightedVerseNumbers] = useState<number[]>([]);
  const [comparisonVersionIds, setComparisonVersionIds] = useState<string[]>([]);
  const [comparisonBookId, setComparisonBookId] = useState('');
  const [comparisonChapterNumber, setComparisonChapterNumber] = useState(1);
  const [comparisonChapters, setComparisonChapters] = useState<BibleChapter[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const compactHeader = useCompactHeader();
  const {
    books,
    chapters,
    displayPassageTitle,
    error,
    goToNextChapter,
    goToPreviousChapter,
    isResolvingReference,
    loading,
    canGoNext,
    canGoPrevious,
    selectedVerseNumber,
    selectedBook,
    selectedBookId,
    selectedChapter,
    selectedChapterId,
    selectedVersion,
    selectedVersionId,
    setSelectedBookId,
    setSelectedChapterId,
    setSelectedVerseNumber,
    setSelectedVersionId,
    versions,
    verses,
  } = useScriptureReader();

  const isLoading =
    isResolvingReference ||
    loading.versions ||
    loading.books ||
    loading.chapters ||
    loading.verses;
  const { crossReferences, footnotes, licenseNote } = useScriptureChapterMeta(verses);
  const scriptureSearch = useScriptureSearch(searchTerm, selectedVersionId);
  const chapterVerses = useMemo(
    () => verses.filter((verse) => verse.number > 0),
    [verses],
  );
  const chapterSharePayload = buildChapterSharePayload({
    book: selectedBook,
    chapter: selectedChapter,
    chapterVerses,
    version: selectedVersion,
  });
  const verseSharePayload = buildVerseSharePayload({
    book: selectedBook,
    chapter: selectedChapter,
    verse: selectedVerses[0] || undefined,
    version: selectedVersion,
  });
  const selectionSharePayload = buildSelectionSharePayload({
    book: selectedBook,
    chapter: selectedChapter,
    verses: selectedVerses,
    version: selectedVersion,
  });
  const canCompareVerse = selectedVerses.length > 0 && Boolean(selectedBook && selectedChapter && selectedVersionId);
  const defaultCompareVersions = [
    selectedVersion?.id || selectedVersionId,
    versions.find((version) => version.id !== (selectedVersion?.id || selectedVersionId))?.id,
  ].filter(Boolean) as string[];
  const selectedCompareVersions =
    comparisonVersionIds.filter((id) => versions.some((version) => version.id === id)).length > 0
      ? comparisonVersionIds.filter((id) => versions.some((version) => version.id === id))
      : defaultCompareVersions;
  const getVersionLabel = (versionIdToFind: string) =>
    versions.find((version) => version.id.toLowerCase() === versionIdToFind.toLowerCase())?.abbreviation || versionIdToFind;
  const sharedVerseNumbers = useMemo(() => {
    const explicitSelection = parseVerseSelection(searchParams.get('verses'));

    if (explicitSelection.length > 0) {
      return explicitSelection;
    }

    const verseValue = Number(searchParams.get('verse'));
    return Number.isFinite(verseValue) && verseValue > 0 ? [verseValue] : [];
  }, [searchParams]);
  const sharedSelectionKey = useMemo(() => {
    const book = searchParams.get('book');
    const chapter = searchParams.get('chapter');
    const version = searchParams.get('version') || selectedVersionId || '';

    if (!book || !chapter || sharedVerseNumbers.length === 0) {
      return '';
    }

    return [
      normalizeReferenceValue(book),
      chapter,
      normalizeReferenceValue(version),
      sharedVerseNumbers.join(','),
    ].join('|');
  }, [searchParams, selectedVersionId, sharedVerseNumbers]);
  const [appliedSharedSelectionKey, setAppliedSharedSelectionKey] = useState('');

  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setActionMessage(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [actionMessage]);

  useEffect(() => {
    if (versions.length === 0 || comparisonVersionIds.length > 0 || defaultCompareVersions.length === 0) {
      return;
    }

    setComparisonVersionIds(defaultCompareVersions);
  }, [comparisonVersionIds.length, defaultCompareVersions, versions.length]);

  useEffect(() => {
    setSelectedVerses((current) =>
      {
        const next = current.filter((verse) =>
          chapterVerses.some((chapterVerse) => chapterVerse.id === verse.id),
        );

        return next.length === current.length &&
          next.every((verse, index) => verse.id === current[index]?.id)
          ? current
          : next;
      },
    );

    if (selectedVerseNumber && !chapterVerses.some((verse) => verse.number === selectedVerseNumber)) {
      setSelectedVerseNumber(null);
    }

    if (focusVerseNumber && !chapterVerses.some((verse) => verse.number === focusVerseNumber)) {
      setFocusVerseNumber(null);
    }
  }, [chapterVerses, focusVerseNumber, selectedVerseNumber, setSelectedVerseNumber]);

  useEffect(() => {
    if (selectedVerseNumber && selectedVerses.length === 0) {
      setFocusVerseNumber(selectedVerseNumber);
      setSelectedVerseNumber(null);
    }
  }, [selectedVerseNumber, selectedVerses.length, setSelectedVerseNumber]);

  useEffect(() => {
    if (!sharedSelectionKey) {
      if (appliedSharedSelectionKey) {
        setAppliedSharedSelectionKey('');
      }
      return;
    }

    if (!selectedBook || !selectedChapter || chapterVerses.length === 0) {
      return;
    }

    const requestedBook = searchParams.get('book');
    const requestedChapter = Number(searchParams.get('chapter'));
    const requestedVersion = searchParams.get('version');

    const matchesPassage =
      requestedBook &&
      Number.isFinite(requestedChapter) &&
      requestedChapter > 0 &&
      normalizeReferenceValue(selectedBook.name) === normalizeReferenceValue(requestedBook) &&
      selectedChapter.number === requestedChapter &&
      (!requestedVersion ||
        normalizeReferenceValue(selectedVersion?.abbreviation || selectedVersion?.id || selectedVersionId) ===
          normalizeReferenceValue(requestedVersion));

    if (!matchesPassage || appliedSharedSelectionKey === sharedSelectionKey) {
      return;
    }

    const nextSelectedVerses = sharedVerseNumbers
      .map((verseNumber) => chapterVerses.find((verse) => verse.number === verseNumber))
      .filter(Boolean) as BibleVerse[];

    if (nextSelectedVerses.length === 0) {
      return;
    }

    setSelectedVerses(nextSelectedVerses);
    setFocusVerseNumber(nextSelectedVerses[0].number);
    setAppliedSharedSelectionKey(sharedSelectionKey);
  }, [
    appliedSharedSelectionKey,
    chapterVerses,
    searchParams,
    selectedBook,
    selectedChapter,
    selectedVersion,
    selectedVersionId,
    sharedSelectionKey,
    sharedVerseNumbers,
  ]);

  const closeActionSheet = () => {
    setSelectedVerses([]);
    setFocusVerseNumber(null);
  };

  const handleVerseSelect = (verse: BibleVerse) => {
    const exists = selectedVerses.some((item) => item.id === verse.id);
    const next = exists
      ? selectedVerses.filter((item) => item.id !== verse.id)
      : [...selectedVerses, verse].sort((left, right) => left.number - right.number);

    setSelectedVerses(next);
    setFocusVerseNumber(null);
  };

  const writeToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  };

  const copyText = async (text: string | null | undefined, successMessage: string) => {
    if (!text) {
      return;
    }

    await writeToClipboard(text);
    setActionMessage(successMessage);
  };

  const loadChapterComparison = async ({
    bookId,
    chapterNumber,
    highlightedVerseNumbers = comparisonHighlightedVerseNumbers,
    openModal = comparisonOpen,
    versionIds = selectedCompareVersions,
  }: {
    bookId: string;
    chapterNumber: number;
    highlightedVerseNumbers?: number[];
    openModal?: boolean;
    versionIds?: string[];
  }) => {
    if (!bookId || !chapterNumber || versionIds.length === 0) {
      return;
    }

    setComparisonLoading(true);
    try {
      const nextComparison = await compareBibleChapter(versionIds, bookId, chapterNumber);
      setComparison(nextComparison);
      setComparisonBookId(bookId);
      setComparisonChapterNumber(nextComparison.chapter || chapterNumber);
      setComparisonHighlightedVerseNumbers(highlightedVerseNumbers);
      setComparisonOpen(openModal);
    } catch {
      setActionMessage('Unable to compare this chapter right now.');
    } finally {
      setComparisonLoading(false);
    }
  };

  const openChapterComparison = async (highlightedVerseNumbers: number[] = []) => {
    if (!selectedBook || !selectedChapter || !selectedVersionId) {
      return;
    }

    setComparisonChapters(chapters);
    await loadChapterComparison({
      bookId: selectedBook.id,
      chapterNumber: selectedChapter.number,
      highlightedVerseNumbers,
      openModal: true,
    });
  };

  const changeComparisonVersions = async (versionIds: string[]) => {
    if (versionIds.length === 0) {
      return;
    }

    setComparisonVersionIds(versionIds);

    const nextBookId = comparisonBookId || selectedBook?.id;
    const nextChapterNumber = comparisonChapterNumber || selectedChapter?.number;

    if (!comparisonOpen || !nextBookId || !nextChapterNumber) {
      return;
    }

    await loadChapterComparison({
      bookId: nextBookId,
      chapterNumber: nextChapterNumber,
      versionIds,
    });
  };

  const changeComparisonReference = async ({
    bookId,
    chapterNumber,
  }: {
    bookId: string;
    chapterNumber: number;
  }) => {
    if (!selectedVersionId) {
      return;
    }

    let nextChapters = comparisonChapters;

    if (bookId !== comparisonBookId || nextChapters.length === 0) {
      try {
        nextChapters = await getBibleChapters(selectedVersionId, bookId);
        setComparisonChapters(nextChapters);
      } catch {
        setActionMessage('Unable to load chapters for that book right now.');
        return;
      }
    }

    const nextChapterNumber = nextChapters.some((chapter) => chapter.number === chapterNumber)
      ? chapterNumber
      : nextChapters[0]?.number || chapterNumber;

    await loadChapterComparison({
      bookId,
      chapterNumber: nextChapterNumber,
      highlightedVerseNumbers: [],
      openModal: true,
    });
  };

  const openVerseComparison = async () => {
    if (!canCompareVerse) {
      return;
    }

    await openChapterComparison(selectedVerses.map((verse) => verse.number));
  };

  const selectionDescription =
    selectedVerses.length > 0 && selectedBook && selectedChapter
      ? `${selectedVerses
          .slice()
          .sort((left, right) => left.number - right.number)
          .map((verse) => `${verse.number}. ${verse.text}`)
          .join('\n\n')}\n\n${selectedBook.name} ${selectedChapter.number}`
      : 'Choose what you would like to do with this passage.';

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <div className="flex h-screen overflow-hidden">
        <SiteSideNav activePath="/scripture" darkMode={darkMode} onToggleTheme={toggleTheme} />
        <ScriptureBooksRail
          books={books}
          darkMode={darkMode}
          selectedBookId={selectedBookId}
          onBookChange={setSelectedBookId}
        />

        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <div className="lg:hidden">
            <SiteHeader
              activePath="/scripture"
              darkMode={darkMode}
              onToggleTheme={toggleTheme}
            />
          </div>
          <ScriptureReaderTopBar
            autoFocusSearch={forceSearchBarOpen}
            compact={compactHeader && !forceSearchBarOpen}
            darkMode={darkMode}
            searchTerm={searchTerm}
            selectedVersionId={selectedVersionId}
            versions={versions}
            onSearchBlur={() => {
              if (!searchTerm.trim()) {
                setForceSearchBarOpen(false);
              }
            }}
            onSearchChange={setSearchTerm}
            onVersionChange={setSelectedVersionId}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden xl:flex-row">
            <ScriptureDisplay
              darkMode={darkMode}
              displayPassageTitle={displayPassageTitle}
              error={error}
              focusVerseNumber={focusVerseNumber}
              footnotes={footnotes}
              licenseNote={licenseNote}
              loading={isLoading}
              searchError={scriptureSearch.error}
              searchLoading={scriptureSearch.loading}
              searchResults={scriptureSearch.results}
              searchTerm={searchTerm}
              onVerseSelect={handleVerseSelect}
              selectedVerseNumbers={selectedVerses.map((verse) => verse.number)}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              selectedVersion={selectedVersion}
              verses={verses}
            />
            <ScriptureSidePanel
              books={books}
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              darkMode={darkMode}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              selectedVersion={selectedVersion}
              versions={versions}
              crossReferences={crossReferences}
              onNext={goToNextChapter}
              onPrevious={goToPreviousChapter}
            />
          </div>
        </main>
      </div>
      <ScriptureFloatingControls
        books={books}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        chapters={chapters}
        darkMode={darkMode}
        selectedBookId={selectedBookId}
        selectedChapterId={selectedChapterId}
        selectedVersionId={selectedVersionId}
        versions={versions}
        onBookChange={setSelectedBookId}
        onChapterChange={setSelectedChapterId}
        onNext={goToNextChapter}
        onPrevious={goToPreviousChapter}
        onVersionChange={setSelectedVersionId}
      />
      <ScriptureMobilePanels
        books={books}
        darkMode={darkMode}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        selectedVersion={selectedVersion}
        versions={versions}
      />
      <ScriptureCompactControls
        compact={compactHeader && !forceSearchBarOpen}
        darkMode={darkMode}
        selectedVersionId={selectedVersionId}
        versions={versions}
        onSearchOpen={() => setForceSearchBarOpen(true)}
        onVersionChange={setSelectedVersionId}
      />
      <ScriptureActionSheet
        canCompareVerse={canCompareVerse}
        compareVerseLabel={selectedVerses.length > 1 ? 'Compare selection' : 'Compare verse'}
        darkMode={darkMode}
        copySelectionLabel={selectedVerses.length > 1 ? 'Copy selection' : 'Copy verse'}
        description={selectionDescription}
        open={selectedVerses.length > 0}
        onCompareChapter={() => openChapterComparison()}
        onCompareVerse={openVerseComparison}
        onCopySelection={async () => {
          await copyText(
            (selectedVerses.length > 1 ? selectionSharePayload : verseSharePayload)?.copyText,
            selectedVerses.length > 1 ? 'Selection copied.' : 'Verse copied.',
          );
        }}
        title={
          selectionSharePayload?.title ||
          (selectedBook && selectedChapter ? `${selectedBook.name} ${selectedChapter.number}` : 'Scripture actions')
        }
        onClose={closeActionSheet}
        onCopyChapter={async () => {
          await copyText(chapterSharePayload?.copyText, 'Chapter copied.');
        }}
      />
      <ScriptureComparisonModal
        books={books}
        chapters={comparisonChapters}
        comparison={comparison}
        comparisonNavigationLoading={comparisonLoading}
        darkMode={darkMode}
        highlightedVerseNumbers={comparisonHighlightedVerseNumbers}
        open={comparisonOpen}
        selectedBookId={comparisonBookId || selectedBook?.id}
        selectedChapterNumber={comparisonChapterNumber || selectedChapter?.number}
        selectedCompareVersions={selectedCompareVersions}
        versions={versions}
        versionLabelFor={getVersionLabel}
        onClose={() => setComparisonOpen(false)}
        onComparisonReferenceChange={changeComparisonReference}
        onSelectedCompareVersionsChange={changeComparisonVersions}
      />
      {actionMessage ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[75] flex justify-center px-4">
          <div
            className={`rounded-full border px-4 py-2 text-sm font-bold shadow-lg ${
              darkMode
                ? 'border-white/10 bg-zinc-950/95 text-stone-100'
                : 'border-black/10 bg-white/95 text-zinc-900'
            }`}
            role="status"
            aria-live="polite"
          >
            {actionMessage}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ScripturePage;
