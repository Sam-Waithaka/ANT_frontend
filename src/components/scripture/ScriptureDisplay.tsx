import type { ReactNode } from 'react';
import type { BibleBook, BibleChapter, BibleToolRecord, BibleVerse, BibleVersion } from '../../types/scripture';
import ScriptureSearchResults from './ScriptureSearchResults';
import ScriptureStatus from './ScriptureStatus';

type ScriptureDisplayProps = {
  darkMode: boolean;
  error: string;
  footer?: ReactNode;
  loading: boolean;
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
  darkMode,
  error,
  footer,
  loading,
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
  const passageTitle = selectedBook && selectedChapter ? `${selectedBook.name} ${selectedChapter.number}` : 'Scripture';
  const footnotes = scriptureVerses.flatMap((verse) =>
    (verse.notes || [])
      .filter((note) => note.type === 'footnote')
      .map((note) => ({ ...note, verseNumber: note.verseNumber || verse.number })),
  ).filter((note, index, notes) =>
    notes.findIndex((candidate) =>
      candidate.verseNumber === note.verseNumber &&
      candidate.text === note.text &&
      candidate.reference === note.reference
    ) === index,
  );
  const licenseNote = verses
    .flatMap((verse) => verse.notes || [])
    .find((note) => note.reference === 'license');

  return (
    <article className={`min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-16 ${darkMode ? 'bg-[#080808]' : 'bg-[#f8f5ef]'}`}>
      <div className="mx-auto max-w-3xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-900 dark:text-red-200">
            {selectedVersion?.abbreviation || selectedVersion?.name || 'Bible'}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
            {isSearching ? 'Search Scripture' : passageTitle}
          </h1>
          {isSearching && (
            <p className={`mt-3 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              Showing results for "{searchTerm.trim()}"
            </p>
          )}
        </div>

      <div className="pt-7">
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
          <div className="grid gap-5 pb-52 md:pb-36">
            {scriptureVerses.map((verse) => (
              <p key={verse.id} className="grid grid-cols-[2rem_1fr] gap-4 font-serif text-xl leading-9 text-zinc-900 dark:text-stone-100 sm:text-2xl sm:leading-10">
                <span className="pt-1 font-sans text-sm font-bold text-zinc-500 dark:text-stone-400">{verse.number}</span>
                <span>{verse.text}</span>
              </p>
            ))}
            {footnotes.length > 0 && !query && (
              <section className={`mt-8 border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Footnotes</p>
                <div className="mt-4 grid gap-3">
                  {footnotes.map((note) => (
                    <p key={note.id} className={`text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
                      <span className="font-black text-red-900 dark:text-red-200">{note.verseNumber}</span>
                      <span className="ml-2">{note.text}</span>
                    </p>
                  ))}
                </div>
              </section>
            )}
            {licenseNote && !query && (
              <section className={`border-t pt-6 font-sans ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">License Notes</p>
                <p className={`mt-4 whitespace-pre-line text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
                  {licenseNote.text}
                </p>
              </section>
            )}
            {footer}
          </div>
        )}
      </div>
      </div>
    </article>
  );
};

export default ScriptureDisplay;
