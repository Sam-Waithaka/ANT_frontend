import { BookOpen, CalendarDays, CheckCircle2 } from 'lucide-react';
import type { BibleBook, BibleChapter, BibleChapterNote, BibleVersion } from '../../types/scripture';
import BibleToolsPanel from './BibleToolsPanel';
import ChapterNavigation from './ChapterNavigation';

type ScriptureSidePanelProps = {
  books: BibleBook[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  darkMode: boolean;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersion?: BibleVersion;
  versions: BibleVersion[];
  crossReferences: BibleChapterNote[];
  onNext: () => void;
  onPrevious: () => void;
};

const ScriptureSidePanel = ({
  books,
  canGoNext,
  canGoPrevious,
  darkMode,
  selectedBook,
  selectedChapter,
  selectedVersion,
  versions,
  crossReferences,
  onNext,
  onPrevious,
}: ScriptureSidePanelProps) => (
  <aside className={`min-h-0 w-full shrink-0 overflow-y-auto border-t p-4 pb-36 xl:w-80 xl:border-l xl:border-t-0 xl:pb-4 ${
    darkMode ? 'border-white/10 bg-[#111111]' : 'border-black/10 bg-[#fffaf0]'
  }`}>
    <div className="grid content-start gap-4">
    <BibleToolsPanel
      books={books}
      darkMode={darkMode}
      selectedBook={selectedBook}
      selectedChapter={selectedChapter}
      selectedVersion={selectedVersion}
      versions={versions}
    />
    {crossReferences.length > 0 && (
      <section
        className={`rounded-[2rem] border p-5 shadow-sm ${
          darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`grid size-11 place-items-center rounded-full ${darkMode ? 'bg-red-950/40 text-red-100' : 'bg-red-900/10 text-red-900'}`}>
            <BookOpen size={20} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Cross references</p>
            <h2 className="mt-1 text-xl font-black">{selectedBook && selectedChapter ? `${selectedBook.name} ${selectedChapter.number}` : 'Reading now'}</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {crossReferences.map((reference) => (
            <article key={reference.id} className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#fffaf0]'}`}>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">
                {reference.verseNumber ? `Verse ${reference.verseNumber}` : 'Reference'}
              </p>
              <p className={`mt-2 text-sm font-bold leading-6 ${darkMode ? 'text-stone-200' : 'text-zinc-800'}`}>
                {reference.reference || reference.text}
              </p>
              {reference.reference && reference.text !== reference.reference ? (
                <p className={`mt-1 text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>{reference.text}</p>
              ) : null}
            </article>
          ))}
        </div>
        <div className="mt-5">
          <ChapterNavigation
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            onNext={onNext}
            onPrevious={onPrevious}
          />
        </div>
      </section>
    )}

    <section
      className={`rounded-[2rem] border p-5 shadow-sm ${
        darkMode ? 'border-white/10 bg-zinc-950 shadow-black/25' : 'border-black/10 bg-white shadow-zinc-900/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`grid size-11 place-items-center rounded-full ${darkMode ? 'bg-red-950/40 text-red-100' : 'bg-red-900/10 text-red-900'}`}>
          <CalendarDays size={20} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Project 52</p>
          <h2 className="mt-1 text-xl font-black">Continue the journey</h2>
        </div>
      </div>
      <div className={`mt-4 grid gap-3 text-sm ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={17} className={darkMode ? 'text-red-200' : 'text-red-800'} />
          Read alongside the weekly plan
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={17} className={darkMode ? 'text-red-200' : 'text-red-800'} />
          Switch chapters without losing focus
        </div>
      </div>
      <a
        href="/project52"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 dark:focus:ring-offset-black"
      >
        Open Project 52
      </a>
    </section>
    </div>
  </aside>
);

export default ScriptureSidePanel;
