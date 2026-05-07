import type {
  BibleMarkerStatus,
  BibleNoteType,
  BibleResourceType,
} from '../../../types/scripture';
import { formatToolLabel } from './types';

type OptionValue = BibleResourceType | BibleMarkerStatus | BibleNoteType;

type OptionGridToolProps<T extends OptionValue> = {
  allLabel: string;
  darkMode: boolean;
  description: string;
  options: T[];
  selectedVersionLabel: string;
  title: string;
  value: T | '';
  onChange: (value: T | '') => void;
};

const OptionGridTool = <T extends OptionValue>({
  allLabel,
  darkMode,
  description,
  options,
  selectedVersionLabel,
  title,
  value,
  onChange,
}: OptionGridToolProps<T>) => (
  <div className="grid gap-3">
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-900 dark:text-red-200">{title}</p>
        <p className={`text-[11px] font-bold ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
          {selectedVersionLabel}
        </p>
      </div>
      <div className={`rounded-[1.35rem] border p-2 ${darkMode ? 'border-white/10 bg-[#171717]' : 'border-black/10 bg-[#f8f5ef]'}`}>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onChange('')}
            className={`min-h-10 rounded-full px-3 text-xs font-black transition ${
              value === ''
                ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                : darkMode
                  ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                  : 'bg-white text-zinc-700 shadow-sm hover:bg-[#ece7de]'
            }`}
          >
            {allLabel}
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`min-h-10 rounded-full px-3 text-xs font-black transition ${
                value === option
                  ? 'bg-red-800 text-white shadow-md shadow-red-950/20'
                  : darkMode
                    ? 'bg-white/10 text-stone-300 hover:bg-white/15'
                    : 'bg-white text-zinc-700 shadow-sm hover:bg-[#ece7de]'
              }`}
            >
              {formatToolLabel(option)}
            </button>
          ))}
        </div>
      </div>
      <p className={`mt-2 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
        {description}
      </p>
    </div>
  </div>
);

export default OptionGridTool;
