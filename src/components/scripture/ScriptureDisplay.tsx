import type { ReactNode } from 'react';
import type {
  BibleBook,
  BibleChapter,
  BibleChapterCredit,
  BibleChapterNote,
  BibleToolRecord,
  BibleVerse,
  BibleVersion,
} from '../../types/scripture';
import ScriptureReadingContent from './ScriptureReadingContent';
import ScriptureSearchResults from './ScriptureSearchResults';
import ScriptureStatus from './ScriptureStatus';

type ScriptureDisplayProps = {
  chapterCredit?: BibleChapterCredit;
  darkMode: boolean;
  displayPassageTitle?: string;
  error: string;
  footer?: ReactNode;
  focusVerseNumber?: number | null;
  footnotes: BibleChapterNote[];
  licenseNote?: BibleChapterNote;
  loading: boolean;
  onVerseSelect?: (verse: BibleVerse) => void;
  selectedVerseNumbers?: number[];
  searchError?: string;
  searchLoading?: boolean;
  searchResults?: BibleToolRecord[];
  searchTerm: string;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  verses: BibleVerse[];
};

const ScriptureDisplay = ({
  chapterCredit,
  darkMode,
  displayPassageTitle,
  error,
  footer,
  focusVerseNumber,
  footnotes,
  licenseNote,
  loading,
  onVerseSelect,
  selectedVerseNumbers = [],
  searchError = '',
  searchLoading = false,
  searchResults = [],
  searchTerm,
  selectedBook,
  selectedChapter,
  selectedVersion,
  verses,
}: ScriptureDisplayProps) => {
  const query = searchTerm.trim().toLowerCase();
  const isSearching = query.length >= 2;
  const scriptureVerses = verses.filter((verse) => verse.number > 0);
  const passageTitle =
    displayPassageTitle ||
    (selectedBook && selectedChapter ? `${selectedBook.name} ${selectedChapter.number}` : 'Scripture');

  return (
    <article className={`min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-10 sm:px-10 lg:px-16 ${darkMode ? 'bg-[#080808]' : 'bg-[#f8f5ef]'}`}>
      <div className="mx-auto max-w-3xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
            {selectedVersion?.abbreviation || selectedVersion?.name || 'Bible'}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
            {isSearching ? 'Search Scripture' : passageTitle}
          </h1>
          {isSearching && (
            <p className={`mt-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              Showing results for "{searchTerm.trim()}"
            </p>
          )}
        </div>

      <div className="pt-8">
        {isSearching ? (
          <ScriptureSearchResults
            darkMode={darkMode}
            error={searchError}
            loading={searchLoading}
            query={searchTerm.trim()}
            results={searchResults}
          />
        ) : error ? (
          <ScriptureStatus darkMode={darkMode} title="Connection issue" message={error} tone="error" />
        ) : loading ? (
          <div className="grid gap-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="grid grid-cols-[2rem_1fr] gap-4">
                <div className="h-5 rounded-full bg-zinc-200 dark:bg-white/10" />
                <div className="grid gap-3">
                  <div className="h-4 w-full rounded-full bg-zinc-200 dark:bg-white/10" />
                  <div className="h-4 w-4/5 rounded-full bg-zinc-200 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : scriptureVerses.length === 0 ? (
          <ScriptureStatus
            darkMode={darkMode}
            title="No verses found"
            message="Select a chapter to begin reading."
          />
        ) : (
          <ScriptureReadingContent
            darkMode={darkMode}
            chapterCredit={chapterCredit}
            footer={footer}
            focusVerseNumber={focusVerseNumber}
            footnotes={footnotes}
            licenseNote={licenseNote}
            onVerseSelect={onVerseSelect}
            selectedVerseNumbers={selectedVerseNumbers}
            verses={scriptureVerses}
          />
        )}
      </div>
      </div>
    </article>
  );
};

export default ScriptureDisplay;
