import { Search } from 'lucide-react';
import type { BibleBook, BibleSearchResponse, BibleSearchResult, BibleVersion } from '../../../types/scripture';
import { inputClass } from './types';

export type SearchScope = 'selected' | 'all' | 'versions';

type SearchToolProps = {
  books: BibleBook[];
  darkMode: boolean;
  fuzzy: boolean;
  languageCode: string;
  page: number;
  query: string;
  response: BibleSearchResponse | null;
  scope: SearchScope;
  selectedBookId: string;
  selectedVersionIds: string[];
  selectedVersionLabel: string;
  testament: string;
  versions: BibleVersion[];
  onBookChange: (bookId: string) => void;
  onFuzzyChange: (value: boolean) => void;
  onLanguageCodeChange: (languageCode: string) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (query: string) => void;
  onResultOpen: (result: BibleSearchResult) => void;
  onScopeChange: (scope: SearchScope) => void;
  onTestamentChange: (testament: string) => void;
  onToggleVersion: (versionId: string) => void;
};

const filterButtonClass = (active: boolean, darkMode: boolean) =>
  `rounded-full px-3 py-2 text-xs font-black transition ${
    active
      ? 'bg-red-800 text-white'
      : darkMode
        ? 'bg-white/10 text-stone-300 hover:bg-white/15'
        : 'border border-black/10 bg-white text-zinc-700 shadow-sm hover:border-red-900/25'
  }`;

const sanitizeHeadline = (headline: string) => {
  const escapeHtml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
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

const canOpenResult = (result: BibleSearchResult) => Boolean(result.book.osisId && result.chapter && result.verseNumber);

const SearchTool = ({
  books,
  darkMode,
  fuzzy,
  languageCode,
  page,
  query,
  response,
  scope,
  selectedBookId,
  selectedVersionIds,
  selectedVersionLabel,
  testament,
  versions,
  onBookChange,
  onFuzzyChange,
  onLanguageCodeChange,
  onPageChange,
  onQueryChange,
  onResultOpen,
  onScopeChange,
  onTestamentChange,
  onToggleVersion,
}: SearchToolProps) => {
  const results = response?.results || [];
  const hasPrevious = page > 1 && Boolean(response?.previous);
  const hasNext = Boolean(response?.next);
  const firstResult = response?.count && results.length > 0 ? (page - 1) * 25 + 1 : 0;
  const lastResult = response?.count && results.length > 0 ? Math.min(firstResult + results.length - 1, response.count) : 0;

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-stone-500" size={16} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search Scripture"
          className={`${inputClass} pl-10`}
        />
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-900 dark:text-red-200">Version scope</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => onScopeChange('selected')} className={filterButtonClass(scope === 'selected', darkMode)}>
            {selectedVersionLabel}
          </button>
          <button type="button" onClick={() => onScopeChange('versions')} className={filterButtonClass(scope === 'versions', darkMode)}>
            Choose versions
          </button>
          <button type="button" onClick={() => onScopeChange('all')} className={filterButtonClass(scope === 'all', darkMode)}>
            All versions
          </button>
        </div>
      </div>

      {scope === 'versions' && (
        <div className="grid max-h-36 gap-2 overflow-y-auto rounded-2xl border border-black/10 p-3 dark:border-white/10">
          {versions.map((version) => {
            const versionId = version.id;
            const checked = selectedVersionIds.includes(versionId);

            return (
              <label key={versionId} className="flex items-center gap-2 text-xs font-bold">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleVersion(versionId)}
                  className="size-4 accent-red-800"
                />
                <span>{version.abbreviation || versionId}</span>
                <span className={darkMode ? 'text-stone-500' : 'text-zinc-500'}>{version.name}</span>
              </label>
            );
          })}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <select value={selectedBookId} onChange={(event) => onBookChange(event.target.value)} className={inputClass}>
          <option value="">All books</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>{book.name}</option>
          ))}
        </select>
        <select value={languageCode} onChange={(event) => onLanguageCodeChange(event.target.value)} className={inputClass}>
          <option value="">Any language</option>
          <option value="en">English</option>
          <option value="sw">Swahili</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['', 'All Scripture'],
          ['OT', 'Old Testament'],
          ['NT', 'New Testament'],
        ].map(([value, label]) => (
          <button key={label} type="button" onClick={() => onTestamentChange(value)} className={filterButtonClass(testament === value, darkMode)}>
            {label}
          </button>
        ))}
      </div>

      <label className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-sm font-bold ${
        darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white'
      }`}>
        Include close matches
        <input
          type="checkbox"
          checked={fuzzy}
          onChange={(event) => onFuzzyChange(event.target.checked)}
          className="size-5 accent-red-800"
        />
      </label>

      {response && (
        <div className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white'}`}>
          <p className="text-sm font-black">
            {response.count === 1 ? '1 result' : `${response.count} results`}
          </p>
          {response.suggestions.length > 0 && (
            <p className={`mt-2 text-xs leading-5 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
              Suggestions: <span className="font-bold">{response.suggestions.join(', ')}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3">
        {results.map((result) => (
          <article key={result.id} className={`rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {canOpenResult(result) ? (
                  <button
                    type="button"
                    className="text-left text-sm font-black underline-offset-4 hover:underline"
                    onClick={() => onResultOpen(result)}
                  >
                    {result.reference}
                  </button>
                ) : (
                  <p className="text-sm font-black">{result.reference}</p>
                )}
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-900 dark:text-red-200">
                  {[result.version, result.searchType, result.credit?.source].filter(Boolean).join(' · ')}
                </p>
              </div>
              {result.similarity ? (
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${darkMode ? 'bg-white/10 text-stone-300' : 'bg-zinc-100 text-zinc-600'}`}>
                  {Math.round(result.similarity * 100)}%
                </span>
              ) : null}
            </div>
            {result.headline ? (
              <p
                className={`mt-2 text-sm leading-6 [&_mark]:rounded [&_mark]:bg-red-100 [&_mark]:px-1 [&_mark]:text-red-950 dark:[&_mark]:bg-red-950 dark:[&_mark]:text-red-100 ${
                  darkMode ? 'text-stone-300' : 'text-zinc-700'
                }`}
                dangerouslySetInnerHTML={{ __html: sanitizeHeadline(result.headline) }}
              />
            ) : result.text ? (
              <p className={`mt-2 text-sm leading-6 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>{result.text}</p>
            ) : null}
          </article>
        ))}
      </div>

      {response && response.count > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3 dark:border-white/10">
          <button
            type="button"
            aria-label="Previous search page"
            disabled={!hasPrevious}
            onClick={() => onPageChange(page - 1)}
            className={filterButtonClass(hasPrevious, darkMode)}
          >
            Previous
          </button>
          <p className={`text-center text-xs font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
            {firstResult}-{lastResult} of {response.count}
          </p>
          <button
            type="button"
            aria-label="Next search page"
            disabled={!hasNext}
            onClick={() => onPageChange(page + 1)}
            className={filterButtonClass(hasNext, darkMode)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchTool;
