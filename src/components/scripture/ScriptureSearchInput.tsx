import { Search } from 'lucide-react';

type ScriptureSearchInputProps = {
  compact?: boolean;
  darkMode: boolean;
  onChange: (value: string) => void;
  value: string;
};

const ScriptureSearchInput = ({ compact = false, darkMode, onChange, value }: ScriptureSearchInputProps) => (
  <label className={`group relative block transition-all duration-300 ${compact ? 'h-11 w-11 focus-within:w-44' : ''}`}>
    <Search
      className={`pointer-events-none absolute top-1/2 z-10 transition-all ${
        compact
          ? 'left-1/2 -translate-x-1/2 -translate-y-1/2 group-focus-within:left-4 group-focus-within:translate-x-0'
          : 'left-4 -translate-y-1/2'
      } ${darkMode ? 'text-stone-100' : 'text-zinc-900'}`}
      size={19}
      strokeWidth={2.35}
    />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search Scripture..."
      type="search"
      className={`h-11 w-full rounded-full border text-sm font-bold shadow-lg outline-none transition-all focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
        compact
          ? 'cursor-pointer px-0 text-transparent placeholder:text-transparent focus:cursor-text focus:pl-11 focus:pr-4 focus:text-inherit'
          : 'pl-11 pr-4'
      } ${
        darkMode
          ? 'border-white/15 bg-zinc-950 text-stone-100 shadow-black/25 placeholder:text-stone-500 focus:ring-offset-black hover:bg-[#171717] focus:border-red-300'
          : 'border-black/10 bg-white text-zinc-900 shadow-zinc-900/10 placeholder:text-zinc-500 focus:ring-offset-[#f8f5ef] hover:bg-[#fffaf0] focus:border-red-800'
      }`}
    />
  </label>
);

export default ScriptureSearchInput;
