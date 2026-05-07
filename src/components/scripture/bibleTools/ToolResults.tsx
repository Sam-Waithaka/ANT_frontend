import type {
  BibleComparisonChapter,
  BibleToolRecord,
} from '../../../types/scripture';
import { formatToolLabel } from './types';

type ToolResultsProps = {
  comparison: BibleComparisonChapter | null;
  comparisonHasVerses: boolean;
  darkMode: boolean;
  records: BibleToolRecord[];
  resultsClass: string;
  selectedCompareVersions: string[];
  status: string;
  onOpenComparison: () => void;
};

const ToolResults = ({
  comparison,
  comparisonHasVerses,
  darkMode,
  records,
  resultsClass,
  selectedCompareVersions,
  status,
  onOpenComparison,
}: ToolResultsProps) => (
  <div className={resultsClass}>
    {status ? <p className="text-sm leading-6 text-red-800 dark:text-red-200">{status}</p> : null}
    {comparisonHasVerses ? (
      <div className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
        <p className="text-sm font-black">
          {comparison?.book} {comparison?.chapter}
        </p>
        <p className={`mt-1 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
          {comparison?.verses.length} verses compared across {selectedCompareVersions.length} versions.
        </p>
        <button
          type="button"
          onClick={onOpenComparison}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-red-800 px-4 text-sm font-bold text-white transition hover:bg-red-700"
        >
          View comparison
        </button>
      </div>
    ) : null}
    {!status && !comparison && records.length === 0 ? (
      <p className={`px-1 text-sm leading-6 ${darkMode ? 'text-stone-500' : 'text-zinc-400'}`}>
        Run a tool to view API results here.
      </p>
    ) : null}
    <div className="grid gap-3">
      {records.map((record) => (
        <article key={record.id} className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
          <p className="text-sm font-black">{record.title}</p>
          {record.subtitle ? <p className="mt-1 text-xs font-bold text-red-800 dark:text-red-200">{formatToolLabel(record.subtitle)}</p> : null}
          {record.body ? <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>{record.body}</p> : null}
          {record.meta ? <p className={`mt-2 text-xs ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>{formatToolLabel(record.meta)}</p> : null}
        </article>
      ))}
    </div>
  </div>
);

export default ToolResults;
