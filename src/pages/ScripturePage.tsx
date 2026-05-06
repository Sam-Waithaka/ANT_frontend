import { useEffect, useState } from 'react';
import ScriptureActionSheet from '../components/scripture/ScriptureActionSheet';
import ScriptureBooksRail from '../components/scripture/ScriptureBooksRail';
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
import type { BibleVerse } from '../types/scripture';
import {
  buildChapterSharePayload,
  buildVerseSharePayload,
} from '../utils/scriptureShare';

const ScripturePage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [forceSearchBarOpen, setForceSearchBarOpen] = useState(false);
  const [activeVerse, setActiveVerse] = useState<BibleVerse | null>(null);
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
  const chapterVerses = verses.filter((verse) => verse.number > 0);
  const chapterSharePayload = buildChapterSharePayload({
    book: selectedBook,
    chapter: selectedChapter,
    chapterVerses,
    version: selectedVersion,
  });
  const verseSharePayload = buildVerseSharePayload({
    book: selectedBook,
    chapter: selectedChapter,
    verse: activeVerse || undefined,
    version: selectedVersion,
  });

  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setActionMessage(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [actionMessage]);

  useEffect(() => {
    if (activeVerse && !chapterVerses.some((verse) => verse.id === activeVerse.id)) {
      setActiveVerse(null);
    }

    if (
      selectedVerseNumber &&
      !chapterVerses.some((verse) => verse.number === selectedVerseNumber)
    ) {
      setSelectedVerseNumber(null);
    }
  }, [activeVerse, chapterVerses, selectedVerseNumber, setSelectedVerseNumber]);

  const closeActionSheet = () => setActiveVerse(null);

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

  const sharePayload = async (
    payload: { title: string; text: string; url: string; copyText: string } | null,
    successMessage: string,
  ) => {
    if (!payload) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        });
        setActionMessage(successMessage);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        await copyText(payload.copyText, `${successMessage} Copied instead.`);
        return;
      }
    }

    await copyText(payload.copyText, `${successMessage} Copied instead.`);
  };

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
              activeVerseNumber={selectedVerseNumber}
              darkMode={darkMode}
              displayPassageTitle={displayPassageTitle}
              error={error}
              footnotes={footnotes}
              licenseNote={licenseNote}
              loading={isLoading}
              searchError={scriptureSearch.error}
              searchLoading={scriptureSearch.loading}
              searchResults={scriptureSearch.results}
              searchTerm={searchTerm}
              onVerseSelect={(verse) => {
                setSelectedVerseNumber(verse.number);
                setActiveVerse(verse);
              }}
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
        darkMode={darkMode}
        description={
          activeVerse && selectedBook && selectedChapter
            ? `${activeVerse.text}\n\n${selectedBook.name} ${selectedChapter.number}:${activeVerse.number}`
            : 'Choose what you would like to do with this passage.'
        }
        open={Boolean(activeVerse)}
        title={
          activeVerse && selectedBook && selectedChapter
            ? `${selectedBook.name} ${selectedChapter.number}:${activeVerse.number}`
            : 'Scripture actions'
        }
        onClose={closeActionSheet}
        onCopyChapter={async () => {
          await copyText(chapterSharePayload?.copyText, 'Chapter copied.');
          closeActionSheet();
        }}
        onCopyVerse={async () => {
          await copyText(verseSharePayload?.copyText, 'Verse copied.');
          closeActionSheet();
        }}
        onShareChapter={async () => {
          await sharePayload(chapterSharePayload, 'Chapter shared.');
          closeActionSheet();
        }}
        onShareVerse={async () => {
          await sharePayload(verseSharePayload, 'Verse shared.');
          closeActionSheet();
        }}
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
