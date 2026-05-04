import { Search } from 'lucide-react';
import type { BibleVersion } from '../../types/scripture';
import ScriptureVersionSelect from './ScriptureVersionSelect';

type ScriptureCompactControlsProps = {
  compact: boolean;
  darkMode: boolean;
  selectedVersionId: string;
  versions: BibleVersion[];
  onSearchOpen: () => void;
  onVersionChange: (value: string) => void;
};

const ScriptureCompactControls = ({
  compact,
  darkMode,
  selectedVersionId,
  versions,
  onSearchOpen,
  onVersionChange,
}: ScriptureCompactControlsProps) => (
  <div
    className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-[4.75rem] py-3 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
      compact ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
    }`}
    aria-hidden={!compact}
  >
    <div
      className={`pointer-events-auto ml-auto flex w-fit items-center justify-end gap-2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        compact ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0'
      }`}
    >
      <ScriptureVersionSelect
        darkMode={darkMode}
        selectedVersionId={selectedVersionId}
        surface="secondary"
        versions={versions}
        onChange={onVersionChange}
      />
      <button
        type="button"
        onClick={onSearchOpen}
        className={`grid size-11 place-items-center rounded-full border shadow-lg outline-none transition hover:-translate-y-0.5 focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
          darkMode
            ? 'border-white/15 bg-zinc-950 text-stone-100 shadow-black/25 hover:bg-[#171717] focus:ring-offset-black'
            : 'border-black/10 bg-white text-zinc-900 shadow-zinc-900/10 hover:bg-[#fffaf0] focus:ring-offset-[#f8f5ef]'
        }`}
        aria-label="Open Scripture search"
      >
        <Search size={19} strokeWidth={2.35} />
      </button>
    </div>
  </div>
);

export default ScriptureCompactControls;
