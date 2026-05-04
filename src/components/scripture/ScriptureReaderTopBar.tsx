import type { BibleBook, BibleChapter, BibleVersion } from '../../types/scripture';
import ScriptureSearchInput from './ScriptureSearchInput';
import ScriptureVersionSelect from './ScriptureVersionSelect';

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

      <div className="hidden w-80 md:block">
        <ScriptureSearchInput darkMode={darkMode} value={searchTerm} onChange={onSearchChange} />
      </div>
    </div>

    <div className="mt-3 flex gap-2 md:hidden">
      <ScriptureVersionSelect
        darkMode={darkMode}
        selectedVersionId={selectedVersionId}
        versions={versions}
        onChange={onVersionChange}
      />
      <div className="min-w-0 flex-1">
        <ScriptureSearchInput darkMode={darkMode} value={searchTerm} onChange={onSearchChange} />
      </div>
    </div>
  </header>
);

export default ScriptureReaderTopBar;
