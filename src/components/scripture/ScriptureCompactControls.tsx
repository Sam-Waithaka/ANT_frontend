import type { BibleVersion } from '../../types/scripture';
import ScriptureSearchInput from './ScriptureSearchInput';
import ScriptureVersionSelect from './ScriptureVersionSelect';

type ScriptureCompactControlsProps = {
  compact: boolean;
  darkMode: boolean;
  searchTerm: string;
  selectedVersionId: string;
  versions: BibleVersion[];
  onSearchChange: (value: string) => void;
  onVersionChange: (value: string) => void;
};

const ScriptureCompactControls = ({
  compact,
  darkMode,
  searchTerm,
  selectedVersionId,
  versions,
  onSearchChange,
  onVersionChange,
}: ScriptureCompactControlsProps) => (
  <div
    className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-[4.75rem] py-3 transition-all duration-300 ease-out md:hidden ${
      compact ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
    }`}
    aria-hidden={!compact}
  >
    <div className="pointer-events-auto ml-auto flex w-fit items-center justify-end gap-2">
      <ScriptureVersionSelect
        darkMode={darkMode}
        selectedVersionId={selectedVersionId}
        surface="secondary"
        versions={versions}
        onChange={onVersionChange}
      />
      <ScriptureSearchInput
        compact
        darkMode={darkMode}
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  </div>
);

export default ScriptureCompactControls;
