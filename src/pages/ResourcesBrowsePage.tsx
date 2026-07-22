import { ArrowLeft, ArrowRight, Clock3, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResponsiveImage from '../components/media/ResponsiveImage';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../hooks/useTheme';
import { normalizeMediaAssetForDisplay } from '../services/mediaAssetsApi';
import { searchPublicWritings, type PublicSearchQuery } from '../services/publicSearchApi';
import type { PaginatedResponse, PublicWritingCard } from '../types/writing';

type BrowseMode = 'book' | 'category' | 'ministry' | 'series' | 'type';

type RouteParams = {
  osisId?: string;
  slug?: string;
};

const fallbackTones = [
  'from-zinc-950 via-stone-800 to-amber-200',
  'from-stone-950 via-amber-900 to-stone-200',
  'from-zinc-950 via-[#4d3425] to-stone-300',
  'from-zinc-950 via-green-950 to-amber-100',
  'from-zinc-950 via-red-950 to-stone-200',
];

const titleCase = (value = '') => value
  .replace(/[-_]+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const toneFor = (seed: number | string) => fallbackTones[Math.abs(String(seed).split('').reduce((total, char) => total + char.charCodeAt(0), 0)) % fallbackTones.length];
const articleAccent = (article: PublicWritingCard) => article.resource_type_detail?.name || article.writing_type || 'Resource';
const articleAuthor = (article: PublicWritingCard) => article.byline || article.author_display || article.author_attributions?.[0]?.display_name || 'A.I.C Njoro Town';

const resolveBrowseConfig = (mode: BrowseMode, params: RouteParams): { description: string; filter: PublicSearchQuery; label: string; title: string } => {
  if (mode === 'type') {
    const slug = params.slug || '';
    return {
      description: 'Published resources grouped under this resource type.',
      filter: { resource_type_slug: slug },
      label: 'Resource Type',
      title: titleCase(slug),
    };
  }
  if (mode === 'category') {
    const slug = params.slug || '';
    return {
      description: 'Published resources grouped under this category.',
      filter: { category_slug: slug },
      label: 'Category',
      title: titleCase(slug),
    };
  }
  if (mode === 'series') {
    const slug = params.slug || '';
    return {
      description: 'A curated collection of published writings from the church library.',
      filter: { series_slug: slug },
      label: 'Series',
      title: titleCase(slug),
    };
  }
  if (mode === 'book') {
    const osisId = params.osisId || '';
    return {
      description: 'Published writings that reference this book of Scripture.',
      filter: { scripture_book_osis: osisId },
      label: 'Scripture',
      title: titleCase(osisId),
    };
  }
  const slug = params.slug || '';
  return {
    description: 'Published writings connected to this ministry.',
    filter: { ministry_slug: slug },
    label: 'Ministry',
    title: titleCase(slug),
  };
};

const ImageBlock = ({ article }: { article: PublicWritingCard }) => {
  const responsiveAsset = normalizeMediaAssetForDisplay(article.og_image_detail);

  return (
    <div className={`relative min-h-[8.5rem] overflow-hidden bg-gradient-to-br ${toneFor(article.slug || article.id)}`}>
      {responsiveAsset ? <ResponsiveImage alt="" asset={responsiveAsset} className="absolute inset-0 size-full object-cover" preset="card" /> : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.46),transparent_20%),linear-gradient(180deg,transparent,rgba(0,0,0,0.52))]" />
    </div>
  );
};

const ResourceArticleCard = ({ article }: { article: PublicWritingCard }) => (
  <Link to={`/resources/${article.slug}`} className="grid min-w-0 grid-cols-[7rem_1fr] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-zinc-900/5 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/25">
    <ImageBlock article={article} />
    <div className="min-w-0 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">{articleAccent(article)}</p>
      <h3 className="mt-3 text-lg font-black leading-snug tracking-normal text-zinc-950 dark:text-stone-100">{article.title}</h3>
      <div className="mt-4 grid gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-stone-400"><Clock3 size={14} aria-hidden="true" />{article.reading_time_minutes || 1} min read</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-stone-400"><UserRound size={14} aria-hidden="true" />{articleAuthor(article)}</span>
      </div>
    </div>
  </Link>
);

const SkeletonGrid = () => (
  <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {[0, 1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl border border-black/10 bg-white/70 shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-white/5" />)}
  </div>
);

const ResourcesBrowsePage = ({ mode }: { mode: BrowseMode }) => {
  const params = useParams<RouteParams>();
  const { darkMode, toggleTheme } = useTheme();
  const config = useMemo(() => resolveBrowseConfig(mode, params), [mode, params]);
  const [items, setItems] = useState<PublicWritingCard[]>([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const loadPage = useCallback(async (page: number, append = false, signal?: AbortSignal) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');

    try {
      const response: PaginatedResponse<PublicWritingCard> = await searchPublicWritings({ ...config.filter, page, page_size: 24 }, signal);
      setItems((current) => append ? [...current, ...response.results] : response.results);
      setCount(response.count ?? response.results.length);
      setNextPage(response.next ?? null);
      setCurrentPage(page);
    } catch (err) {
      if (signal?.aborted || err instanceof DOMException && err.name === 'AbortError') return;
      setError('Unable to load these resources right now. Please try again shortly.');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [config.filter]);

  useEffect(() => {
    const controller = new AbortController();
    void loadPage(1, false, controller.signal);
    return () => controller.abort();
  }, [loadPage]);

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader activePath="/resources" darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className={`flex-1 ${darkMode ? 'bg-[#080808]' : 'bg-[linear-gradient(180deg,#f8f5ef,#fffaf0_42%,#f8f5ef)]'}`}>
        <section className="border-b border-black/10 px-4 py-14 dark:border-white/10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Link to="/resources" className="inline-flex items-center gap-2 text-sm font-black text-red-800 transition hover:text-red-700 dark:text-red-100">
              <ArrowLeft size={16} aria-hidden="true" /> Back to Resources
            </Link>
            <p className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-red-700 dark:text-red-200">{config.label}</p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold leading-tight tracking-normal text-zinc-950 dark:text-stone-100 sm:text-6xl">{config.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-700 dark:text-stone-300">{config.description}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">{loading ? 'Loading resources' : `${count} ${count === 1 ? 'Resource' : 'Resources'}`}</p>
          </div>
          {error ? <div className="rounded-2xl border border-red-900/15 bg-red-50 p-5 text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100">{error}</div> : null}
          {loading ? <SkeletonGrid /> : items.length ? (
            <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((article) => <ResourceArticleCard article={article} key={article.id} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-black/10 bg-white/70 p-8 text-center shadow-lg shadow-zinc-900/5 dark:border-white/10 dark:bg-white/5">
              <h2 className="font-serif text-3xl font-bold">No published resources here yet.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-stone-400">Once published writings are connected to this part of the library, they will appear here.</p>
            </div>
          )}
          {nextPage ? (
            <div className="flex justify-center pt-2">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-red-800 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                disabled={loadingMore}
                onClick={() => void loadPage(currentPage + 1, true)}
                type="button"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default ResourcesBrowsePage;
