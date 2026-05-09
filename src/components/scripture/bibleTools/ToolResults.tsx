import type {
  BibleComparisonChapter,
  BibleToolRecord,
  BibleToolResponse,
} from '../../../types/scripture';
import { formatToolLabel, type ToolKey } from './types';

type ToolResultsProps = {
  activeTool: ToolKey;
  comparison: BibleComparisonChapter | null;
  comparisonHasVerses: boolean;
  darkMode: boolean;
  loadingMore: boolean;
  records: BibleToolRecord[];
  resultsClass: string;
  selectedCompareVersions: string[];
  status: string;
  toolResponse: BibleToolResponse | null;
  onLoadMore: () => void;
  onOpenComparison: () => void;
};

const markerExplanation = (status?: string) => {
  if (status === 'omitted') {
    return 'This verse is intentionally omitted or represented by a marker in this source.';
  }

  if (status === 'empty_marker') {
    return 'The source has a marker here, but no verse text was supplied.';
  }

  if (status === 'source_unavailable') {
    return 'The source text for this verse is not available.';
  }

  return '';
};

const glossaryCardClass = (darkMode: boolean) =>
  `rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`;

const ToolResults = ({
  activeTool,
  comparison,
  comparisonHasVerses,
  darkMode,
  loadingMore,
  records,
  resultsClass,
  selectedCompareVersions,
  status,
  toolResponse,
  onLoadMore,
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
    {toolResponse ? (
      <div className={`mb-3 rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
        <p className="text-sm font-black">
          {toolResponse.count === 1 ? '1 result' : `${toolResponse.count} results`}
        </p>
        {activeTool === 'glossary' ? (
          <p className={`mt-1 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            Glossary matches for the selected Bible version.
          </p>
        ) : null}
        {activeTool === 'notes' ? (
          <p className={`mt-1 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            Reader annotations are preferred when available; these notes remain available as a legacy fallback.
          </p>
        ) : null}
      </div>
    ) : null}
    <div className="grid gap-3">
      {records.map((record) =>
        activeTool === 'glossary' ? (
          <article key={record.id} className={glossaryCardClass(darkMode)}>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">Glossary term</p>
            <h3 className="mt-2 text-base font-black">{record.title}</h3>
            {record.subtitle ? (
              <p className={`mt-1 text-xs font-bold ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                {formatToolLabel(record.subtitle)}
              </p>
            ) : null}
            {record.body ? (
              <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>{record.body}</p>
            ) : null}
            {record.meta ? (
              <p className={`mt-3 rounded-xl border p-2 text-xs leading-5 ${darkMode ? 'border-white/10 bg-black/20 text-stone-400' : 'border-black/10 bg-[#fffaf0] text-zinc-600'}`}>
                {formatToolLabel(record.meta)}
              </p>
            ) : null}
          </article>
        ) : (
          <article key={record.id} className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
            <p className="text-sm font-black">{record.title}</p>
            {record.subtitle ? <p className="mt-1 text-xs font-bold text-red-800 dark:text-red-200">{formatToolLabel(record.subtitle)}</p> : null}
            {record.body ? <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>{record.body}</p> : null}
            {record.meta ? <p className={`mt-2 text-xs ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>{formatToolLabel(record.meta)}</p> : null}
            {activeTool === 'markers' && markerExplanation(record.meta) ? (
              <p className={`mt-2 rounded-xl border p-2 text-xs leading-5 ${darkMode ? 'border-white/10 bg-black/20 text-stone-400' : 'border-black/10 bg-[#fffaf0] text-zinc-600'}`}>
                {markerExplanation(record.meta)}
              </p>
            ) : null}
          </article>
        ),
      )}
    </div>
    {toolResponse?.next ? (
      <button
        type="button"
        disabled={loadingMore}
        onClick={onLoadMore}
        className={`mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full border px-4 text-sm font-bold transition ${
          darkMode
            ? 'border-white/10 bg-white/[0.045] text-stone-100 hover:border-red-200/40 disabled:text-stone-500'
            : 'border-black/10 bg-white text-zinc-900 shadow-sm hover:border-red-900/25 disabled:text-zinc-400'
        }`}
      >
        {loadingMore ? 'Loading more...' : 'Load more'}
      </button>
    ) : null}
  </div>
);

export default ToolResults;
