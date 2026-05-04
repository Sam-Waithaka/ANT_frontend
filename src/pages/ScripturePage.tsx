import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ScriptureAppNav from '../components/scripture/ScriptureAppNav';
import ScriptureBooksRail from '../components/scripture/ScriptureBooksRail';
import ScriptureDisplay from '../components/scripture/ScriptureDisplay';
import ScriptureMobileNav from '../components/scripture/ScriptureMobileNav';
import ScriptureReaderTopBar from '../components/scripture/ScriptureReaderTopBar';
import ScriptureSidePanel from '../components/scripture/ScriptureSidePanel';
import { useScriptureReader } from '../hooks/useScriptureReader';
import { useTheme } from '../hooks/useTheme';

const ScripturePage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const {
    books,
    chapters,
    error,
    goToNextChapter,
    goToPreviousChapter,
    loading,
    selectedBook,
    selectedBookId,
    selectedChapter,
    selectedChapterId,
    selectedChapterIndex,
    selectedVersion,
    selectedVersionId,
    setSelectedBookId,
    setSelectedChapterId,
    setSelectedVersionId,
    versions,
    verses,
  } = useScriptureReader();

  const isLoading = loading.versions || loading.books || loading.chapters || loading.verses;
  const canGoNext = selectedChapterIndex >= 0 && selectedChapterIndex < chapters.length - 1;
  const canGoPrevious = selectedChapterIndex > 0;

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <div className="flex min-h-screen">
        <ScriptureAppNav darkMode={darkMode} onToggleTheme={toggleTheme} />
        <ScriptureBooksRail
          books={books}
          darkMode={darkMode}
          selectedBookId={selectedBookId}
          onBookChange={setSelectedBookId}
        />

        <main className="min-w-0 flex-1">
          <ScriptureReaderTopBar
            books={books}
            chapters={chapters}
            darkMode={darkMode}
            searchTerm={searchTerm}
            selectedBook={selectedBook}
            selectedBookId={selectedBookId}
            selectedChapter={selectedChapter}
            selectedChapterId={selectedChapterId}
            selectedVersionId={selectedVersionId}
            versions={versions}
            onBookChange={setSelectedBookId}
            onChapterChange={setSelectedChapterId}
            onSearchChange={setSearchTerm}
            onVersionChange={setSelectedVersionId}
          />

          <div className="flex min-w-0 flex-col xl:flex-row">
            <button
              type="button"
              onClick={goToPreviousChapter}
              disabled={!canGoPrevious}
              className="fixed bottom-24 left-4 z-30 grid size-11 place-items-center rounded-full bg-white text-zinc-950 shadow-lg transition disabled:hidden dark:bg-white/10 dark:text-stone-100 md:hidden"
              aria-label="Previous chapter"
            >
              <ChevronLeft size={22} />
            </button>
            <ScriptureDisplay
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              darkMode={darkMode}
              error={error}
              loading={isLoading}
              searchTerm={searchTerm}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              selectedVersion={selectedVersion}
              verses={verses}
              onNext={goToNextChapter}
              onPrevious={goToPreviousChapter}
            />
            <button
              type="button"
              onClick={goToNextChapter}
              disabled={!canGoNext}
              className="fixed bottom-24 right-4 z-30 grid size-11 place-items-center rounded-full bg-red-800 text-white shadow-lg transition disabled:hidden md:hidden"
              aria-label="Next chapter"
            >
              <ChevronRight size={22} />
            </button>
            <ScriptureSidePanel
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              darkMode={darkMode}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              selectedVersion={selectedVersion}
              versions={versions}
              onNext={goToNextChapter}
              onPrevious={goToPreviousChapter}
            />
          </div>
        </main>
      </div>
      <ScriptureMobileNav darkMode={darkMode} />
    </div>
  );
};

export default ScripturePage;
