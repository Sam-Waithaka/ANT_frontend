import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { BibleBook, BibleChapter, BookFilter } from '../../types/scripture';

type PickerPlacement = 'top' | 'bottom';
type ChapterLabel = 'number' | 'chapter';

type PickerBaseProps = {
  darkMode: boolean;
  fullWidth?: boolean;
  menuClassName: string;
  open: boolean;
  placement?: PickerPlacement;
  onOpenChange: (open: boolean) => void;
};

type ScriptureBookPickerProps = PickerBaseProps & {
  books: BibleBook[];
  gridClassName?: string;
  selectedBookId: string;
  onBookChange: (value: string) => void;
};

type ScriptureChapterPickerProps = PickerBaseProps & {
  chapters: BibleChapter[];
  gridClassName?: string;
  labelStyle?: ChapterLabel;
  selectedChapterId: string;
  onChapterChange: (value: string) => void;
};

const bookFilters: Array<[BookFilter, string]> = [
  ['both', 'Both'],
  ['old', 'OT'],
  ['new', 'NT'],
];

const pillBase =
  'relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-700';

const getMenuBaseClass = (placement: PickerPlacement) =>
  placement === 'bottom'
    ? 'absolute top-full z-50 mt-3 rounded-3xl border p-4 shadow-2xl'
    : 'absolute bottom-full z-50 mb-3 rounded-3xl border p-4 shadow-2xl';

const getMenuSurfaceClass = (darkMode: boolean) =>
  darkMode
    ? 'border-white/10 bg-zinc-950 text-stone-100 shadow-black/40'
    : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/15';

const getNeutralPillClass = (darkMode: boolean) =>
  darkMode
    ? 'border-white/15 bg-white/10 text-stone-100 backdrop-blur-xl hover:bg-white/15'
    : 'border-black/10 bg-[#fffaf0]/70 text-zinc-700 backdrop-blur-xl hover:bg-white/80';

const getInactiveOptionClass = (darkMode: boolean) =>
  darkMode
    ? 'text-stone-300 hover:bg-white/10'
    : 'text-zinc-700 hover:bg-[#fffaf0]';

export const ScriptureBookPicker = ({
  books,
  darkMode,
  fullWidth = false,
  gridClassName = 'grid max-h-80 grid-cols-2 gap-1 overflow-y-auto md:grid-cols-3',
  menuClassName,
  onBookChange,
  onOpenChange,
  open,
  placement = 'top',
  selectedBookId,
}: ScriptureBookPickerProps) => {
  const [bookFilter, setBookFilter] = useState<BookFilter>('both');
  const selectedBook = books.find((book) => book.id === selectedBookId);
  const filteredBooks = books.filter((book) => bookFilter === 'both' || book.testament === bookFilter);
  const inactiveOptionClass = getInactiveOptionClass(darkMode);

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`${pillBase} ${getNeutralPillClass(darkMode)} ${
          fullWidth ? 'w-full justify-between' : 'max-w-[11rem] sm:max-w-[15rem]'
        }`}
      >
        <span className="truncate">{selectedBook?.name || 'Book'}</span>
        <ChevronDown size={15} className="shrink-0 text-red-800 dark:text-red-200" />
      </button>

      {open && (
        <div className={`${getMenuBaseClass(placement)} ${getMenuSurfaceClass(darkMode)} ${menuClassName}`}>
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
          <div className={gridClassName}>
            {filteredBooks.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => {
                  onBookChange(book.id);
                  onOpenChange(false);
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
  );
};

export const ScriptureChapterPicker = ({
  chapters,
  darkMode,
  fullWidth = false,
  gridClassName = 'grid max-h-72 grid-cols-5 gap-2 overflow-y-auto sm:grid-cols-6',
  labelStyle = 'number',
  menuClassName,
  onChapterChange,
  onOpenChange,
  open,
  placement = 'top',
  selectedChapterId,
}: ScriptureChapterPickerProps) => {
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId);
  const label = selectedChapter
    ? labelStyle === 'chapter'
      ? `Chapter ${selectedChapter.number}`
      : selectedChapter.number
    : 'Ch';

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`${pillBase} ${getNeutralPillClass(darkMode)} ${
          fullWidth ? 'w-full justify-between' : 'min-w-[4.75rem]'
        }`}
      >
        <span>{label}</span>
        <ChevronDown size={15} className="shrink-0 text-red-800 dark:text-red-200" />
      </button>

      {open && (
        <div className={`${getMenuBaseClass(placement)} ${getMenuSurfaceClass(darkMode)} ${menuClassName}`}>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Chapter</p>
          <div className={gridClassName}>
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onClick={() => {
                  onChapterChange(chapter.id);
                  onOpenChange(false);
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
  );
};
