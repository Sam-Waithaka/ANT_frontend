import type { BibleVersion } from '../../types/scripture';
import ScriptureSearchInput from './ScriptureSearchInput';
import ScriptureVersionSelect from './ScriptureVersionSelect';

type ScriptureReaderTopBarProps = {
  autoFocusSearch?: boolean;
  compact: boolean;
  darkMode: boolean;
  searchTerm: string;
  selectedVersionId: string;
  versions: BibleVersion[];
  onSearchChange: (value: string) => void;
  onSearchBlur?: () => void;
  onVersionChange: (value: string) => void;
};

const ScriptureReaderTopBar = ({
  autoFocusSearch = false,
  compact,
  darkMode,
  searchTerm,
  selectedVersionId,
  versions,
  onSearchBlur,
  onSearchChange,
  onVersionChange,
}: ScriptureReaderTopBarProps) => {
  return (
  <header
    className={`shrink-0 overflow-hidden border-b px-4 backdrop-blur-xl transition-[max-height,opacity,transform,padding,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
      compact
        ? 'max-h-20 translate-y-0 py-2 opacity-100 max-lg:max-h-0 max-lg:-translate-y-3 max-lg:border-b-0 max-lg:py-0 max-lg:opacity-0'
        : 'max-h-20 translate-y-0 py-2 opacity-100'
    } ${
      darkMode ? 'border-white/10 bg-[#080808]/92' : 'border-black/10 bg-[#f8f5ef]/92'
    }`}
  >
    <div
      className={`flex items-center justify-end gap-2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        compact
          ? 'translate-y-0 scale-100 opacity-100 max-md:-translate-y-2 max-md:scale-[0.98] max-md:opacity-0'
          : 'translate-y-0 scale-100 opacity-100'
      }`}
    >
      <div className="hidden w-[min(22rem,42vw)] md:block">
        <ScriptureSearchInput
          autoFocus={autoFocusSearch}
          darkMode={darkMode}
          value={searchTerm}
          onBlur={onSearchBlur}
          onChange={onSearchChange}
        />
      </div>

      <div className="ml-auto flex max-w-[18rem] min-w-0 flex-1 justify-end gap-2 md:hidden">
        <ScriptureVersionSelect
          darkMode={darkMode}
          selectedVersionId={selectedVersionId}
          versions={versions}
          onChange={onVersionChange}
        />
        <div className="min-w-0 flex-none">
          <ScriptureSearchInput
            autoFocus={autoFocusSearch}
            darkMode={darkMode}
            value={searchTerm}
            onBlur={onSearchBlur}
            onChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  </header>
  );
};

export default ScriptureReaderTopBar;
