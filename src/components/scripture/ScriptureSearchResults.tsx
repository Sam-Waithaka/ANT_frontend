import { Search } from 'lucide-react';
import type { BibleSearchResult } from '../../types/scripture';
import ScriptureStatus from './ScriptureStatus';

type ScriptureSearchResultsProps = {
  count: number;
  darkMode: boolean;
  error: string;
  hasFuzzyResults: boolean;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onResultOpen?: (result: BibleSearchResult) => void;
  query: string;
  results: BibleSearchResult[];
  suggestions: string[];
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const sanitizeHeadline = (headline: string) => {
  const markTagPattern = /<\s*(\/?)\s*mark\s*>/gi;
  let cursor = 0;
  let safeHtml = '';
  let match: RegExpExecArray | null;

  while ((match = markTagPattern.exec(headline)) !== null) {
    safeHtml += escapeHtml(headline.slice(cursor, match.index));
    safeHtml += match[1] ? '</mark>' : '<mark>';
    cursor = match.index + match[0].length;
  }

  return `${safeHtml}${escapeHtml(headline.slice(cursor))}`;
};

const resultCanOpen = (result: BibleSearchResult) =>
  Boolean(result.book.osisId && result.chapter && result.verseNumber);

const ScriptureSearchResults = ({
  count,
  darkMode,
  error,
  hasFuzzyResults,
  hasMore,
  loading,
  loadingMore,
  onLoadMore,
  onResultOpen,
  query,
  results,
  suggestions,
}: ScriptureSearchResultsProps) => {
  if (error) {
    return <ScriptureStatus darkMode={darkMode} title="Search issue" message={error} tone="error" />;
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={`rounded-2xl border p-5 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white'}`}>
            <div className="h-4 w-32 rounded-full bg-zinc-200 dark:bg-white/10" />
            <div className="mt-4 h-4 w-full rounded-full bg-zinc-200 dark:bg-white/10" />
            <div className="mt-3 h-4 w-4/5 rounded-full bg-zinc-200 dark:bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <ScriptureStatus
        darkMode={darkMode}
        title="No results found"
        message={`No Scripture results matched "${query}". Try a different word or phrase.`}
      />
    );
  }

  return (
    <section className="grid gap-4 pb-52 md:pb-36">
      <div className={`rounded-2xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white/70'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold">
            {count === 1 ? '1 result' : `${count} results`} for "{query}"
          </p>
          {hasFuzzyResults && (
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
              darkMode ? 'bg-red-950/50 text-red-100' : 'bg-red-50 text-red-900'
            }`}>
              Showing close matches
            </span>
          )}
        </div>
        {suggestions.length > 0 && (
          <p className={`mt-3 text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            Suggestions: <span className="font-bold">{suggestions.join(', ')}</span>
          </p>
        )}
      </div>
      {results.map((result) => (
        <article
          key={result.id}
          className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
            darkMode
              ? 'border-white/10 bg-white/[0.04] hover:border-red-200/40'
              : 'border-black/10 bg-white shadow-sm hover:border-red-900/25'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 rounded-full p-2 ${darkMode ? 'bg-red-950/50 text-red-100' : 'bg-red-50 text-red-900'}`}>
              <Search size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {resultCanOpen(result) ? (
                  <button
                    type="button"
                    className="text-left text-base font-black underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-red-900/50 dark:focus:ring-red-200/50"
                    onClick={() => onResultOpen?.(result)}
                  >
                    {result.reference}
                  </button>
                ) : (
                  <h2 className="text-base font-black">{result.reference}</h2>
                )}
                {result.version && (
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                    darkMode ? 'bg-white/10 text-stone-300' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {result.version}
                  </span>
                )}
              </div>
              {result.headline ? (
                <p
                  className={`mt-3 font-serif text-xl leading-8 [&_mark]:rounded [&_mark]:bg-red-100 [&_mark]:px-1 [&_mark]:text-red-950 dark:[&_mark]:bg-red-950 dark:[&_mark]:text-red-100 ${
                    darkMode ? 'text-stone-100' : 'text-zinc-900'
                  }`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHeadline(result.headline) }}
                />
              ) : result.text && (
                <p className={`mt-3 font-serif text-xl leading-8 ${darkMode ? 'text-stone-100' : 'text-zinc-900'}`}>
                  {result.text}
                </p>
              )}
              {(result.searchType || result.credit?.source) && (
                <p className={`mt-3 text-xs font-bold uppercase tracking-[0.12em] ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                  {[result.searchType, result.credit?.source].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
      {hasMore && (
        <button
          type="button"
          disabled={loadingMore}
          onClick={onLoadMore}
          className={`mt-2 rounded-full border px-5 py-3 text-sm font-black transition ${
            darkMode
              ? 'border-white/10 bg-white/[0.04] text-stone-100 hover:border-red-200/40 disabled:text-stone-500'
              : 'border-black/10 bg-white text-zinc-900 shadow-sm hover:border-red-900/25 disabled:text-zinc-400'
          }`}
        >
          {loadingMore ? 'Loading more...' : 'Load more'}
        </button>
      )}
    </section>
  );
};

export default ScriptureSearchResults;
