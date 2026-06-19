import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import WritingArticleCard from '../../../components/portal/writing/WritingArticleCard';
import WritingStudioShell from '../../../components/portal/writing/WritingStudioShell';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { fetchWritings } from '../../../services/writingApi';
import type { Writing, WritingStatus } from '../../../types/writing';

const statuses: Array<WritingStatus | 'ALL'> = ['ALL', 'DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];

const WritingArticlesPage = () => {
  const auth = useAuth();
  const { darkMode } = useTheme();
  const [articles, setArticles] = useState<Writing[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WritingStatus | 'ALL'>('ALL');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchWritings(auth.accessToken, { page_size: 24, search, status }, controller.signal)
      .then((page) => setArticles(page.results))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load writings.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [auth.accessToken, search, status]);

  return (
    <WritingStudioShell>
      <section className={`rounded-3xl border p-4 shadow-lg ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-[#f8f5ef]'}`}>
            <Search size={18} />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search writings"
              value={search}
            />
          </label>
          <select
            className={`rounded-2xl border px-4 py-3 text-sm font-bold outline-none ${darkMode ? 'border-white/10 bg-zinc-950 text-stone-100' : 'border-black/10 bg-white text-zinc-900'}`}
            onChange={(event) => setStatus(event.target.value as WritingStatus | 'ALL')}
            value={status}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>{item === 'ALL' ? 'All statuses' : item.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </section>

      {error ? <p className="mt-6 rounded-2xl bg-red-950/5 p-4 text-sm font-bold text-red-800">{error}</p> : null}
      {loading ? <p className={`mt-8 text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>Loading writings...</p> : null}

      {!loading && articles.length === 0 ? (
        <div className={`mt-8 rounded-3xl border p-8 text-center ${darkMode ? 'border-white/10 bg-zinc-950' : 'border-black/10 bg-white'}`}>
          <p className="font-serif text-3xl">No writings found.</p>
          <p className={`mt-3 ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>New resources will appear here as drafts are created.</p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => <WritingArticleCard key={article.id} darkMode={darkMode} writing={article} />)}
      </div>
    </WritingStudioShell>
  );
};

export default WritingArticlesPage;
