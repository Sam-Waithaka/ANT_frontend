import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import WritingArticleCard from '../../../components/portal/writing/WritingArticleCard';
import { portalSurface } from '../../../components/portal/portalSurface';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { fetchWritings } from '../../../services/writingApi';
import type { Writing, WritingStatus } from '../../../types/writing';

const PAGE_SIZE = 24;
const statuses: Array<WritingStatus | 'ALL'> = ['ALL', 'DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];

const readStatusParam = (value: string | null): WritingStatus | 'ALL' => (
  value && statuses.includes(value as WritingStatus | 'ALL') ? value as WritingStatus | 'ALL' : 'ALL'
);

const appendUniqueWritings = (current: Writing[], next: Writing[]) => {
  const seen = new Set(current.map((item) => String(item.id)));
  return [
    ...current,
    ...next.filter((item) => {
      const key = String(item.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  ];
};

const WritingArticlesPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Writing[]>([]);
  const [error, setError] = useState('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WritingStatus | 'ALL'>(() => readStatusParam(searchParams.get('status')));

  useEffect(() => {
    const nextStatus = readStatusParam(searchParams.get('status'));
    setStatus((current) => current === nextStatus ? current : nextStatus);
    setPage(1);
  }, [searchParams]);

  const handleStatusChange = (nextStatus: WritingStatus | 'ALL') => {
    setStatus(nextStatus);
    setPage(1);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextStatus === 'ALL') next.delete('status');
      else next.set('status', nextStatus);
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchWritings(auth.accessToken, { page, page_size: PAGE_SIZE, search, status }, controller.signal)
      .then((resultPage) => {
        setArticles((current) => page === 1 ? resultPage.results : appendUniqueWritings(current, resultPage.results));
        setHasNextPage(Boolean(resultPage.next));
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load writings.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [auth.accessToken, page, search, status]);

  const loadingMore = loading && page > 1;

  return (
    <WritingStudioShell>
      <section className={`rounded-3xl border p-4 shadow-lg ${portalSurface.panel(darkMode)}`}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-white/5' : 'border-[#eaded0] bg-white'}`}>
            <Search size={18} />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search writings"
              value={search}
            />
          </label>
          <select
            className={`rounded-2xl border px-4 py-3 text-sm font-bold outline-none ${darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-[#eaded0] bg-white text-zinc-900'}`}
            onChange={(event) => handleStatusChange(event.target.value as WritingStatus | 'ALL')}
            value={status}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>{item === 'ALL' ? 'All statuses' : item.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </section>

      {error ? <p className="mt-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{error}</p> : null}
      {loading && page === 1 ? <p className={`mt-8 text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>Loading writings...</p> : null}

      {!loading && articles.length === 0 ? (
        <div className={`mt-8 rounded-3xl border p-8 text-center ${portalSurface.panel(darkMode)}`}>
          <p className="font-serif text-3xl">No writings found.</p>
          <p className={`mt-3 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>New resources will appear here as drafts are created.</p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => <WritingArticleCard key={article.id} darkMode={darkMode} writing={article} />)}
      </div>

      {hasNextPage ? (
        <div className="mt-8 flex justify-center">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-6 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={loadingMore}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            {loadingMore ? 'Loading more...' : 'Load more'}
          </button>
        </div>
      ) : null}
    </WritingStudioShell>
  );
};

export default WritingArticlesPage;




