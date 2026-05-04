import { Search } from 'lucide-react';
import type { BibleToolRecord } from '../../types/scripture';
import ScriptureStatus from './ScriptureStatus';

type ScriptureSearchResultsProps = {
  darkMode: boolean;
  error: string;
  loading: boolean;
  query: string;
  results: BibleToolRecord[];
};

const ScriptureSearchResults = ({ darkMode, error, loading, query, results }: ScriptureSearchResultsProps) => {
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
                <h2 className="text-base font-black">{result.title}</h2>
                {result.subtitle && (
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                    darkMode ? 'bg-white/10 text-stone-300' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {result.subtitle}
                  </span>
                )}
              </div>
              {result.body && (
                <p className={`mt-3 font-serif text-xl leading-8 ${darkMode ? 'text-stone-100' : 'text-zinc-900'}`}>
                  {result.body}
                </p>
              )}
              {result.meta && (
                <p className={`mt-3 text-xs font-bold uppercase tracking-[0.12em] ${darkMode ? 'text-stone-500' : 'text-zinc-500'}`}>
                  {result.meta}
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};

export default ScriptureSearchResults;
