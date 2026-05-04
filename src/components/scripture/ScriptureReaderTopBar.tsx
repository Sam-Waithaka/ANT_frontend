import type { BibleVersion } from '../../types/scripture';
import ScriptureSearchInput from './ScriptureSearchInput';
import ScriptureVersionSelect from './ScriptureVersionSelect';

type ScriptureReaderTopBarProps = {
  compact: boolean;
  darkMode: boolean;
  searchTerm: string;
  selectedVersionId: string;
  versions: BibleVersion[];
  onSearchChange: (value: string) => void;
  onVersionChange: (value: string) => void;
};

const ScriptureReaderTopBar = ({
  compact,
  darkMode,
  searchTerm,
  selectedVersionId,
  versions,
  onSearchChange,
  onVersionChange,
}: ScriptureReaderTopBarProps) => (
  <header
    className={`shrink-0 overflow-hidden border-b px-4 backdrop-blur-xl transition-all duration-300 ${
      compact ? 'max-h-0 border-b-0 py-0 opacity-0' : 'max-h-20 py-2 opacity-100'
    } ${
      darkMode ? 'border-white/10 bg-[#080808]/92' : 'border-black/10 bg-[#f8f5ef]/92'
    }`}
  >
    <div className="flex items-center justify-end gap-2">
      <div className="hidden w-[min(22rem,42vw)] md:block">
        <ScriptureSearchInput darkMode={darkMode} value={searchTerm} onChange={onSearchChange} />
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
            darkMode={darkMode}
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  </header>
);

export default ScriptureReaderTopBar;
