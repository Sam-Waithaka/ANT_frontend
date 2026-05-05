import { useState } from 'react';
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

const ScripturePage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [forceSearchBarOpen, setForceSearchBarOpen] = useState(false);
  const compactHeader = useCompactHeader();
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
  const { crossReferences, footnotes, licenseNote } = useScriptureChapterMeta(verses);
  const scriptureSearch = useScriptureSearch(searchTerm, selectedVersionId);

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
              error={error}
              footnotes={footnotes}
              licenseNote={licenseNote}
              loading={isLoading}
              searchError={scriptureSearch.error}
              searchLoading={scriptureSearch.loading}
              searchResults={scriptureSearch.results}
              searchTerm={searchTerm}
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
              onBookChange={setSelectedBookId}
              onChapterChange={setSelectedChapterId}
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
        onBookChange={setSelectedBookId}
        onChapterChange={setSelectedChapterId}
      />
      <ScriptureCompactControls
        compact={compactHeader && !forceSearchBarOpen}
        darkMode={darkMode}
        selectedVersionId={selectedVersionId}
        versions={versions}
        onSearchOpen={() => setForceSearchBarOpen(true)}
        onVersionChange={setSelectedVersionId}
      />
    </div>
  );
};

export default ScripturePage;
