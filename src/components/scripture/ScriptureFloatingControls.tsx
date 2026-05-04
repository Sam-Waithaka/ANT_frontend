import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { BibleBook, BibleChapter, BibleVersion, BookFilter } from '../../types/scripture';

type ScriptureFloatingControlsProps = {
  books: BibleBook[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  chapters: BibleChapter[];
  darkMode: boolean;
  selectedBookId: string;
  selectedChapterId: string;
  selectedVersionId: string;
  versions: BibleVersion[];
  onBookChange: (value: string) => void;
  onChapterChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onVersionChange: (value: string) => void;
};

type OpenMenu = 'version' | 'book' | 'chapter' | null;

const bookFilters: Array<[BookFilter, string]> = [
  ['both', 'Both'],
  ['old', 'OT'],
  ['new', 'NT'],
];

const pillBase =
  'relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-700';

const menuBase =
  'absolute bottom-full mb-3 rounded-3xl border p-4 shadow-2xl';

const ScriptureFloatingControls = ({
  books,
  canGoNext,
  canGoPrevious,
  chapters,
  darkMode,
  selectedBookId,
  selectedChapterId,
  selectedVersionId,
  versions,
  onBookChange,
  onChapterChange,
  onNext,
  onPrevious,
  onVersionChange,
}: ScriptureFloatingControlsProps) => {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [bookFilter, setBookFilter] = useState<BookFilter>('both');
  const selectedVersion = versions.find((version) => version.id === selectedVersionId);
  const selectedBook = books.find((book) => book.id === selectedBookId);
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId);
  const filteredBooks = books.filter((book) => bookFilter === 'both' || book.testament === bookFilter);
  const controlSurfaceClass = darkMode
    ? 'border-white/10 bg-zinc-950/10 text-stone-100 shadow-black/40 backdrop-blur-xl'
    : 'border-black/10 bg-white/10 text-zinc-950 shadow-zinc-900/15 backdrop-blur-xl';
  const menuSurfaceClass = darkMode
    ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/40'
    : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/15';
  const neutralPillClass = darkMode
    ? 'border-white/15 bg-white/10 text-stone-100 backdrop-blur-xl hover:bg-white/15'
    : 'border-black/10 bg-[#fffaf0]/70 text-zinc-700 backdrop-blur-xl hover:bg-white/80';
  const inactiveOptionClass = darkMode
    ? 'text-stone-300 hover:bg-white/10'
    : 'text-zinc-700 hover:bg-[#fffaf0]';

  const closeMenu = () => setOpenMenu(null);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 px-4 md:left-44 md:right-0 md:px-6 lg:left-[23rem] xl:bottom-6 xl:right-80">
      <div className={`pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-2 rounded-[2rem] border p-2 shadow-2xl ${controlSurfaceClass}`}>
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-red-800 text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous chapter"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'version' ? null : 'version')}
              className={`${pillBase} ${neutralPillClass} min-w-[4.75rem]`}
            >
              <span className="max-w-[6ch] truncate">{selectedVersion?.abbreviation || selectedVersion?.id || 'Bible'}</span>
              <ChevronDown size={15} className="shrink-0 text-red-800 dark:text-red-200" />
            </button>
            {openMenu === 'version' && (
              <div className={`${menuBase} ${menuSurfaceClass} left-0 w-80`}>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Version</p>
                <div className="grid max-h-72 gap-1.5 overflow-y-auto">
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => {
                        onVersionChange(version.id);
                        closeMenu();
                      }}
                      className={`rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                        version.id === selectedVersionId
                          ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                          : inactiveOptionClass
                      }`}
                    >
                      <span className="font-black">{version.abbreviation || version.id}</span>
                      <span className={`ml-2 text-xs ${version.id === selectedVersionId ? 'text-white/75' : darkMode ? 'text-stone-400' : 'text-zinc-500'}`}>{version.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'book' ? null : 'book')}
              className={`${pillBase} ${neutralPillClass} max-w-[11rem] sm:max-w-[15rem]`}
            >
              <span className="truncate">{selectedBook?.name || 'Book'}</span>
              <ChevronDown size={15} className="shrink-0 text-red-800 dark:text-red-200" />
            </button>
            {openMenu === 'book' && (
              <div className={`${menuBase} ${menuSurfaceClass} left-1/2 w-[min(90vw,34rem)] -translate-x-1/2`}>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Book</p>
                <div className={`mb-4 grid grid-cols-3 gap-1 rounded-full border p-1 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
                  {bookFilters.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBookFilter(value)}
                      className={`min-h-9 rounded-full px-3 text-xs font-black transition ${
                        bookFilter === value
                          ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                          : darkMode
                            ? 'text-stone-300 hover:bg-white/10'
                            : 'text-zinc-600 hover:bg-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="grid max-h-80 grid-cols-2 gap-1 overflow-y-auto md:grid-cols-3">
                  {filteredBooks.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => {
                        onBookChange(book.id);
                        closeMenu();
                      }}
                      className={`rounded-xl px-3 py-2 text-left text-sm font-bold leading-tight transition ${
                        book.id === selectedBookId
                          ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                          : inactiveOptionClass
                      }`}
                    >
                      {book.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'chapter' ? null : 'chapter')}
              className={`${pillBase} ${neutralPillClass} min-w-[4.75rem]`}
            >
              <span>{selectedChapter?.number || 'Ch'}</span>
              <ChevronDown size={15} className="shrink-0 text-red-800 dark:text-red-200" />
            </button>
            {openMenu === 'chapter' && (
              <div className={`${menuBase} ${menuSurfaceClass} right-0 w-72 sm:w-80`}>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Chapter</p>
                <div className="grid max-h-72 grid-cols-5 gap-2 overflow-y-auto sm:grid-cols-6">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => {
                        onChapterChange(chapter.id);
                        closeMenu();
                      }}
                      className={`grid size-10 place-items-center rounded-full text-sm font-black transition ${
                        chapter.id === selectedChapterId
                          ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                          : darkMode
                            ? 'bg-white/10 text-stone-100 hover:bg-white/15'
                            : 'bg-[#f8f5ef] text-zinc-950 hover:bg-[#ece7de]'
                      }`}
                    >
                      {chapter.number}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-red-800 text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Next chapter"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default ScriptureFloatingControls;
