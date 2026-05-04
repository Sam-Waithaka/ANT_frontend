import type { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../../types/scripture';
import ScriptureStatus from './ScriptureStatus';

type ScriptureDisplayProps = {
  darkMode: boolean;
  error: string;
  loading: boolean;
  searchTerm: string;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  verses: BibleVerse[];
};

const ScriptureDisplay = ({
  darkMode,
  error,
  loading,
  searchTerm,
  selectedBook,
  selectedChapter,
  selectedVersion,
  verses,
}: ScriptureDisplayProps) => {
  const query = searchTerm.trim().toLowerCase();
  const filteredVerses = query ? verses.filter((verse) => verse.text.toLowerCase().includes(query)) : verses;
  const passageTitle = selectedBook && selectedChapter ? `${selectedBook.name} ${selectedChapter.number}` : 'Scripture';

  return (
    <article className={`min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-16 ${darkMode ? 'bg-[#080808]' : 'bg-[#f8f5ef]'}`}>
      <div className="mx-auto max-w-3xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
            {selectedVersion?.abbreviation || selectedVersion?.name || 'Bible'}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-normal sm:text-5xl">{passageTitle}</h1>
        </div>

      <div className="pt-7">
        {error ? (
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
        ) : filteredVerses.length === 0 ? (
          <ScriptureStatus
            darkMode={darkMode}
            title="No verses found"
            message={query ? 'No verses in this chapter match your search.' : 'Select a chapter to begin reading.'}
          />
        ) : (
          <div className="grid gap-5 pb-52 md:pb-36">
            {filteredVerses.map((verse) => (
              <p key={verse.id} className="grid grid-cols-[2rem_1fr] gap-4 font-serif text-xl leading-9 text-zinc-900 dark:text-stone-100 sm:text-2xl sm:leading-10">
                <span className="pt-1 font-sans text-sm font-bold text-zinc-500 dark:text-stone-400">{verse.number}</span>
                <span>
                  {verse.number === 16 ? <span className="text-red-800 dark:text-red-200">{verse.text}</span> : verse.text}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
      </div>
    </article>
  );
};

export default ScriptureDisplay;
