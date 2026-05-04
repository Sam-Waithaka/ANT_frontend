import { Search } from 'lucide-react';

type ScriptureSearchInputProps = {
  darkMode: boolean;
  onChange: (value: string) => void;
  responsiveIcon?: boolean;
  value: string;
};

const ScriptureSearchInput = ({ darkMode, onChange, responsiveIcon = false, value }: ScriptureSearchInputProps) => (
  <label className="group relative block">
    <Search
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transition-all ${
        responsiveIcon ? 'max-[420px]:left-1/2 max-[420px]:-translate-x-1/2 max-[420px]:group-focus-within:left-4 max-[420px]:group-focus-within:translate-x-0 min-[421px]:left-4' : 'left-4'
      } ${darkMode ? 'text-stone-400' : 'text-zinc-500'}`}
      size={17}
    />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search Scripture..."
      type="search"
      className={`h-11 w-full rounded-full border pl-11 pr-4 text-sm font-bold outline-none transition-all ${
        responsiveIcon ? 'max-[420px]:w-11 max-[420px]:cursor-pointer max-[420px]:px-0 max-[420px]:text-transparent max-[420px]:placeholder:text-transparent max-[420px]:focus:w-44 max-[420px]:focus:cursor-text max-[420px]:focus:pl-11 max-[420px]:focus:pr-4 max-[420px]:focus:text-inherit' : ''
      } ${
        darkMode
          ? 'border-white/15 bg-white/10 text-stone-100 placeholder:text-stone-500 focus:border-red-300'
          : 'border-black/10 bg-white text-zinc-950 shadow-sm placeholder:text-zinc-500 focus:border-red-800'
      }`}
    />
  </label>
);

export default ScriptureSearchInput;
