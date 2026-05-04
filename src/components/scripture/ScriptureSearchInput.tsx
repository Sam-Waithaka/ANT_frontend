import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ScriptureSearchInputProps = {
  autoFocus?: boolean;
  compact?: boolean;
  darkMode: boolean;
  onBlur?: () => void;
  onChange: (value: string) => void;
  value: string;
};

const ScriptureSearchInput = ({
  autoFocus = false,
  compact = false,
  darkMode,
  onBlur,
  onChange,
  value,
}: ScriptureSearchInputProps) => {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const surfaceClass = darkMode
    ? 'border-white/15 bg-zinc-950 text-stone-100 shadow-black/25 hover:bg-[#171717] focus:ring-offset-black'
    : 'border-black/10 bg-white text-zinc-900 shadow-zinc-900/10 hover:bg-[#fffaf0] focus:ring-offset-[#f8f5ef]';

  useEffect(() => {
    if (expanded || autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus, expanded]);

  if (compact && !expanded && !value) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={`grid size-11 place-items-center rounded-full border shadow-lg outline-none transition hover:-translate-y-0.5 focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${surfaceClass}`}
        aria-label="Search Scripture"
      >
        <Search size={19} strokeWidth={2.35} />
      </button>
    );
  }

  return (
    <label className={`group relative block transition-all duration-300 ${compact ? 'w-44' : ''}`}>
      <Search
        className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-all ${darkMode ? 'text-stone-100' : 'text-zinc-900'}`}
        size={19}
        strokeWidth={2.35}
      />
      <input
        ref={inputRef}
        value={value}
        onBlur={() => {
          if (compact && !value.trim()) {
            setExpanded(false);
          }
          onBlur?.();
        }}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Scripture..."
        type="search"
        className={`h-11 w-full rounded-full border pl-11 pr-4 text-sm font-bold shadow-lg outline-none transition-all focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
          darkMode
            ? 'border-white/15 bg-zinc-950 text-stone-100 shadow-black/25 placeholder:text-stone-500 focus:ring-offset-black hover:bg-[#171717] focus:border-red-300'
            : 'border-black/10 bg-white text-zinc-900 shadow-zinc-900/10 placeholder:text-zinc-500 focus:ring-offset-[#f8f5ef] hover:bg-[#fffaf0] focus:border-red-800'
        }`}
      />
    </label>
  );
};

export default ScriptureSearchInput;
