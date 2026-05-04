import { Search } from 'lucide-react';
import type { BibleBook, BibleChapter, BibleVersion } from '../../types/scripture';
import ScriptureSelect from './ScriptureSelect';

type ScriptureToolbarProps = {
  books: BibleBook[];
  chapters: BibleChapter[];
  searchTerm: string;
  selectedBookId: string;
  selectedChapterId: string;
  selectedVersionId: string;
  versions: BibleVersion[];
  onBookChange: (value: string) => void;
  onChapterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onVersionChange: (value: string) => void;
};

const ScriptureToolbar = ({
  books,
  chapters,
  searchTerm,
  selectedBookId,
  selectedChapterId,
  selectedVersionId,
  versions,
  onBookChange,
  onChapterChange,
  onSearchChange,
  onVersionChange,
}: ScriptureToolbarProps) => (
  <section className="rounded-[2rem] border border-black/10 bg-white/85 p-4 shadow-2xl shadow-zinc-900/10 dark:border-white/10 dark:bg-zinc-950/70 dark:shadow-black/40 sm:p-5">
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1.2fr]">
      <ScriptureSelect
        label="Version"
        options={versions.map((version) => ({
          id: version.id,
          label: version.abbreviation ? `${version.abbreviation} - ${version.name}` : version.name,
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
        options={chapters.map((chapter) => ({ id: chapter.id, label: chapter.label }))}
        value={selectedChapterId}
        onChange={onChapterChange}
      />
      <label className="grid gap-2">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">Search</span>
        <span className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-stone-400"
            size={18}
          />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search this chapter"
            type="search"
            className="min-h-12 w-full rounded-full border border-black/10 bg-white pl-11 pr-4 text-sm font-bold text-zinc-950 shadow-sm outline-none transition placeholder:font-medium focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:border-white/10 dark:bg-white/10 dark:text-stone-100 dark:placeholder:text-stone-400 dark:focus:border-red-300"
          />
        </span>
      </label>
    </div>
  </section>
);

export default ScriptureToolbar;
