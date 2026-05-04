import { useEffect, useState } from 'react';
import ScriptureBooksRail from '../components/scripture/ScriptureBooksRail';
import ScriptureDisplay from '../components/scripture/ScriptureDisplay';
import ScriptureFloatingControls from '../components/scripture/ScriptureFloatingControls';
import ScriptureMobileNav from '../components/scripture/ScriptureMobileNav';
import ScriptureReaderTopBar from '../components/scripture/ScriptureReaderTopBar';
import ScriptureSidePanel from '../components/scripture/ScriptureSidePanel';
import SiteFooter from '../components/SiteFooter';
import SiteSideNav from '../components/SiteSideNav';
import { useScriptureReader } from '../hooks/useScriptureReader';
import { useTheme } from '../hooks/useTheme';
import { searchBible } from '../services/scriptureApi';
import type { BibleToolRecord } from '../types/scripture';

const ScripturePage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BibleToolRecord[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const {
    books,
    chapters,
    error,
    goToNextChapter,
    goToPreviousChapter,
    loading,
    canGoNext,
    canGoPrevious,
    selectedBook,
    selectedBookId,
    selectedChapter,
    selectedChapterId,
    selectedVersion,
    selectedVersionId,
    setSelectedBookId,
    setSelectedChapterId,
    setSelectedVersionId,
    versions,
    verses,
  } = useScriptureReader();

  const isLoading = loading.versions || loading.books || loading.chapters || loading.verses;
  const normalizedSearchTerm = searchTerm.trim();
  const crossReferences = verses.flatMap((verse) =>
    (verse.notes || [])
      .filter((note) => note.type === 'cross_reference')
      .map((note) => ({ ...note, verseNumber: note.verseNumber || verse.number })),
  );

  useEffect(() => {
    if (normalizedSearchTerm.length < 2) {
      setSearchResults([]);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');

      try {
        const results = await searchBible({
          q: normalizedSearchTerm,
          version: selectedVersionId || undefined,
        });

        if (!controller.signal.aborted) {
          setSearchResults(results);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults([]);
          setSearchError('We could not search Scripture right now. Confirm the Bible API is running.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [normalizedSearchTerm, selectedVersionId]);

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
          <ScriptureReaderTopBar
            darkMode={darkMode}
            searchTerm={searchTerm}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            onSearchChange={setSearchTerm}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden xl:flex-row">
            <ScriptureDisplay
              darkMode={darkMode}
              error={error}
              loading={isLoading}
              searchError={searchError}
              searchLoading={searchLoading}
              searchResults={searchResults}
              searchTerm={searchTerm}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              selectedVersion={selectedVersion}
              verses={verses}
              footer={<SiteFooter darkMode={darkMode} />}
            />
            <ScriptureSidePanel
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
      <ScriptureMobileNav darkMode={darkMode} />
    </div>
  );
};

export default ScripturePage;
