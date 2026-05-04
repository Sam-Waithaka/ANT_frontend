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
      className={`scripture-search-icon pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-all ${darkMode ? 'text-stone-100' : 'text-zinc-900'}`}
      size={19}
      strokeWidth={2.35}
    />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search Scripture..."
      type="search"
      className={`scripture-search-input h-11 w-full rounded-full border pl-11 pr-4 text-sm font-bold shadow-lg backdrop-blur-xl outline-none transition-all focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
        responsiveIcon ? 'w-48 max-w-[52vw]' : ''
      } ${
        darkMode
          ? 'border-white/15 bg-white/10 text-stone-100 shadow-black/25 placeholder:text-stone-500 focus:ring-offset-black hover:bg-white/15 focus:border-red-300'
          : 'border-black/10 bg-white/70 text-zinc-900 shadow-zinc-900/15 placeholder:text-zinc-500 focus:ring-offset-[#f8f5ef] hover:bg-white/85 focus:border-red-800'
      }`}
    />
  </label>
);

export default ScriptureSearchInput;
