import { ArrowRight, ChevronDown, Search, Volume2 } from 'lucide-react';
import type { BibleBook, BibleChapter, BibleVersion } from '../../types/scripture';
import ScriptureSelect from './ScriptureSelect';

type ScriptureReaderTopBarProps = {
  books: BibleBook[];
  chapters: BibleChapter[];
  darkMode: boolean;
  searchTerm: string;
  selectedBook?: BibleBook;
  selectedBookId: string;
  selectedChapter?: BibleChapter;
  selectedChapterId: string;
  selectedVersionId: string;
  versions: BibleVersion[];
  onBookChange: (value: string) => void;
  onChapterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onVersionChange: (value: string) => void;
};

const ScriptureReaderTopBar = ({
  books,
  chapters,
  darkMode,
  searchTerm,
  selectedBook,
  selectedBookId,
  selectedChapter,
  selectedChapterId,
  selectedVersionId,
  versions,
  onBookChange,
  onChapterChange,
  onSearchChange,
  onVersionChange,
}: ScriptureReaderTopBarProps) => (
  <header
    className={`sticky top-0 z-30 border-b px-4 py-3 backdrop-blur-xl ${
      darkMode ? 'border-white/10 bg-[#080808]/90' : 'border-black/10 bg-[#f8f5ef]/90'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
        <div className="w-36">
          <ScriptureSelect
            label="Version"
            options={versions.map((version) => ({
              id: version.id,
              label: version.abbreviation || version.name,
            }))}
            value={selectedVersionId}
            onChange={onVersionChange}
          />
        </div>
        <div className="w-44">
          <ScriptureSelect
            label="Book"
            options={books.map((book) => ({ id: book.id, label: book.name }))}
            value={selectedBookId}
            onChange={onBookChange}
          />
        </div>
        <div className="w-40">
          <ScriptureSelect
            label="Chapter"
            options={chapters.map((chapter) => ({ id: chapter.id, label: chapter.label }))}
            value={selectedChapterId}
            onChange={onChapterChange}
          />
        </div>
      </div>

      <button className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full text-sm font-black md:hidden">
        <span className="truncate">{selectedBook && selectedChapter ? `${selectedBook.name} ${selectedChapter.number}` : 'Scripture'}</span>
        <ChevronDown size={16} className="text-red-800 dark:text-red-200" />
      </button>

      <label className="relative hidden w-72 lg:block">
        <Search className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`} size={17} />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Scripture..."
          type="search"
          className={`h-11 w-full rounded-full border pl-11 pr-4 text-sm font-bold outline-none transition ${
            darkMode
              ? 'border-white/10 bg-white/10 text-stone-100 placeholder:text-stone-500 focus:border-red-300'
              : 'border-black/10 bg-white text-zinc-950 shadow-sm placeholder:text-zinc-500 focus:border-red-800'
          }`}
        />
      </label>

      <button
        type="button"
        className={`grid size-11 shrink-0 place-items-center rounded-full border transition hover:-translate-y-0.5 ${
          darkMode ? 'border-white/10 bg-white/10 text-stone-200' : 'border-black/10 bg-white text-zinc-800 shadow-sm'
        }`}
        aria-label="Audio reading"
      >
        <Volume2 size={18} />
      </button>
      <a
        href="/project52"
        className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black text-red-800 transition hover:bg-red-900/10 dark:text-red-200 dark:hover:bg-white/10 sm:inline-flex"
      >
        Continue Reading
        <ArrowRight size={17} />
      </a>
    </div>

    <div className="mt-3 grid gap-3 md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <ScriptureSelect
          label="Version"
          options={versions.map((version) => ({
            id: version.id,
            label: version.abbreviation || version.name,
          }))}
          value={selectedVersionId}
          onChange={onVersionChange}
        />
        <ScriptureSelect
          label="Book"
          options={books.map((book) => ({ id: book.id, label: book.name }))}
          value={selectedBookId}
          onChange={onBookChange}
        />
        <ScriptureSelect
          label="Chapter"
          options={chapters.map((chapter) => ({ id: chapter.id, label: String(chapter.number) }))}
          value={selectedChapterId}
          onChange={onChapterChange}
        />
      </div>
      <label className="relative">
        <Search className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`} size={17} />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search this chapter"
          type="search"
          className={`h-11 w-full rounded-full border pl-11 pr-4 text-sm font-bold outline-none transition ${
            darkMode
              ? 'border-white/10 bg-white/10 text-stone-100 placeholder:text-stone-500 focus:border-red-300'
              : 'border-black/10 bg-white text-zinc-950 shadow-sm placeholder:text-zinc-500 focus:border-red-800'
          }`}
        />
      </label>
    </div>
  </header>
);

export default ScriptureReaderTopBar;
