import { ChevronDown } from 'lucide-react';
import type { BibleVersion } from '../../types/scripture';

type ScriptureVersionSelectProps = {
  darkMode: boolean;
  onChange: (value: string) => void;
  selectedVersionId: string;
  versions: BibleVersion[];
};

const ScriptureVersionSelect = ({
  darkMode,
  onChange,
  selectedVersionId,
  versions,
}: ScriptureVersionSelectProps) => (
  <label className="relative shrink-0">
    <select
      value={selectedVersionId}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Bible version"
      className={`h-11 max-w-[6.75rem] appearance-none rounded-full border py-0 pl-4 pr-8 text-sm font-black outline-none transition ${
        darkMode
          ? 'border-white/15 bg-white/10 text-stone-100 focus:border-red-300'
          : 'border-black/10 bg-white text-zinc-950 shadow-sm focus:border-red-800'
      }`}
    >
      {versions.map((version) => (
        <option key={version.id} value={version.id}>
          {version.abbreviation || version.id}
        </option>
      ))}
    </select>
    <ChevronDown
      className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-red-200' : 'text-red-900'}`}
      size={15}
    />
  </label>
);

export default ScriptureVersionSelect;
