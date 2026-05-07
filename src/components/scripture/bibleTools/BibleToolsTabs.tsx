import type { ToolKey } from './types';
import { tools } from './types';

type BibleToolsTabsProps = {
  activeTool: ToolKey;
  darkMode: boolean;
  onChange: (tool: ToolKey) => void;
};

const BibleToolsTabs = ({ activeTool, darkMode, onChange }: BibleToolsTabsProps) => (
  <div className="mt-4 flex flex-wrap gap-2">
    {tools.map(([key, label]) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`rounded-full px-3 py-2 text-xs font-black transition ${
          activeTool === key
            ? 'bg-red-800 text-white'
            : darkMode
              ? 'bg-white/10 text-stone-300 hover:bg-white/15'
              : 'border border-black/10 bg-[#fffaf0] text-zinc-700 shadow-sm hover:bg-white'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default BibleToolsTabs;
