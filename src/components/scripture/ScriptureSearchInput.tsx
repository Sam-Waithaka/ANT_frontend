import { Search } from 'lucide-react';

type ScriptureSearchInputProps = {
  darkMode: boolean;
  onChange: (value: string) => void;
  value: string;
};

const ScriptureSearchInput = ({ darkMode, onChange, value }: ScriptureSearchInputProps) => (
  <label className="relative block">
    <Search className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`} size={17} />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search Scripture..."
      type="search"
      className={`h-11 w-full rounded-full border pl-11 pr-4 text-sm font-bold outline-none transition ${
        darkMode
          ? 'border-white/10 bg-white/10 text-stone-100 placeholder:text-stone-500 focus:border-red-300'
          : 'border-black/10 bg-white text-zinc-950 shadow-sm placeholder:text-zinc-500 focus:border-red-800'
      }`}
    />
  </label>
);

export default ScriptureSearchInput;
