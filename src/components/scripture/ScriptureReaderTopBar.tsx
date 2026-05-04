import type { BibleVersion } from '../../types/scripture';
import ScriptureSearchInput from './ScriptureSearchInput';
import ScriptureVersionSelect from './ScriptureVersionSelect';

type ScriptureReaderTopBarProps = {
  darkMode: boolean;
  searchTerm: string;
  selectedVersionId: string;
  versions: BibleVersion[];
  onSearchChange: (value: string) => void;
  onVersionChange: (value: string) => void;
};

const ScriptureReaderTopBar = ({
  darkMode,
  searchTerm,
  selectedVersionId,
  versions,
  onSearchChange,
  onVersionChange,
}: ScriptureReaderTopBarProps) => (
  <header
    className={`shrink-0 border-b px-4 py-3 backdrop-blur-xl transition-colors duration-300 ${
      darkMode ? 'border-white/10 bg-[#080808]/92' : 'border-black/10 bg-[#f8f5ef]/92'
    }`}
  >
    <div className="flex items-center justify-end gap-3">
      <div className="hidden w-[min(22rem,42vw)] md:block">
        <ScriptureSearchInput darkMode={darkMode} value={searchTerm} onChange={onSearchChange} />
      </div>

      <div className="flex min-w-0 flex-1 justify-end gap-2 md:hidden">
        <ScriptureVersionSelect
          darkMode={darkMode}
          selectedVersionId={selectedVersionId}
          versions={versions}
          onChange={onVersionChange}
        />
        <div className="min-w-0 max-w-[14rem] flex-1 max-[420px]:flex-none">
          <ScriptureSearchInput
            darkMode={darkMode}
            responsiveIcon
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  </header>
);

export default ScriptureReaderTopBar;
