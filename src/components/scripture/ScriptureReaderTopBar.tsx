import { ChevronDown, Search } from 'lucide-react';
import type { BibleBook, BibleChapter, BibleVersion } from '../../types/scripture';

type ScriptureReaderTopBarProps = {
  darkMode: boolean;
  searchTerm: string;
  selectedBook?: BibleBook;
  selectedChapter?: BibleChapter;
  selectedVersionId: string;
  versions: BibleVersion[];
  onSearchChange: (value: string) => void;
  onVersionChange: (value: string) => void;
};

const ScriptureReaderTopBar = ({
  darkMode,
  searchTerm,
  selectedBook,
  selectedChapter,
  selectedVersionId,
  versions,
  onSearchChange,
  onVersionChange,
}: ScriptureReaderTopBarProps) => (
  <header
    className={`shrink-0 border-b px-4 py-3 backdrop-blur-xl ${
      darkMode ? 'border-white/10 bg-[#080808]/90' : 'border-black/10 bg-[#f8f5ef]/90'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-black uppercase tracking-[0.16em] ${darkMode ? 'text-red-200' : 'text-red-900'}`}>
          Scripture
        </p>
        <h1 className="truncate text-lg font-black">
          {selectedBook && selectedChapter ? `${selectedBook.name} ${selectedChapter.number}` : 'Scripture'}
        </h1>
      </div>

      <div className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full text-sm font-black md:hidden">
        <span className="truncate">{selectedBook && selectedChapter ? `${selectedBook.name} ${selectedChapter.number}` : 'Scripture'}</span>
      </div>

      <label className="relative hidden w-80 md:block">
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
    </div>

    <div className="mt-3 flex gap-2 md:hidden">
      <label className="relative shrink-0">
        <select
          value={selectedVersionId}
          onChange={(event) => onVersionChange(event.target.value)}
          aria-label="Bible version"
          className={`h-11 max-w-[6.75rem] appearance-none rounded-full border py-0 pl-4 pr-8 text-sm font-black outline-none transition ${
            darkMode
              ? 'border-white/10 bg-white/10 text-stone-100 focus:border-red-300'
              : 'border-black/10 bg-white text-zinc-950 shadow-sm focus:border-red-800'
          }`}
        >
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.abbreviation || version.id}
            </option>
          ))}
        </select>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-red-200' : 'text-red-900'}`} size={15} />
      </label>

      <label className="relative min-w-0 flex-1">
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
    </div>
  </header>
);

export default ScriptureReaderTopBar;
