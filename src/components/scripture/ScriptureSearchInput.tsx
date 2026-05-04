import { Search } from 'lucide-react';

type ScriptureSearchInputProps = {
  darkMode: boolean;
  onChange: (value: string) => void;
  responsiveIcon?: boolean;
  value: string;
};

const ScriptureSearchInput = ({ darkMode, onChange, responsiveIcon = false, value }: ScriptureSearchInputProps) => (
  <label className="scripture-search-control group relative block">
    <Search
      className={`scripture-search-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-all ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}
      size={17}
    />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search Scripture..."
      type="search"
      className={`scripture-search-input h-11 w-full rounded-full border pl-11 pr-4 text-sm font-bold outline-none transition-all ${
        responsiveIcon ? 'w-48 max-w-[52vw]' : ''
      } ${
        darkMode
          ? 'border-white/15 bg-white/10 text-stone-100 shadow-lg shadow-black/25 placeholder:text-stone-500 hover:bg-white/15 focus:border-red-300'
          : 'border-black/10 bg-white/85 text-zinc-950 shadow-lg shadow-zinc-900/15 placeholder:text-zinc-500 hover:bg-[#fffaf0] focus:border-red-800'
      }`}
    />
  </label>
);

export default ScriptureSearchInput;
