import type { AudioVisualGroupDetail, AudioVisualItem } from '../../types/audioVisual';
import MediaRail from './MediaRail';

type MediaSeriesDetailProps = {
  canLoadMore?: boolean;
  darkMode: boolean;
  itemCount?: number;
  items?: AudioVisualItem[];
  loadMoreError?: string;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  series: AudioVisualGroupDetail | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
};

const MediaSeriesDetail = ({
  canLoadMore = false,
  darkMode,
  itemCount,
  items,
  loadMoreError = '',
  loadingMore = false,
  onLoadMore,
  series,
  status,
}: MediaSeriesDetailProps) => {
  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return (
      <section className="grid gap-6" aria-busy="true" aria-label="Loading media series">
        <div className={`h-48 animate-pulse rounded-3xl border ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white'}`} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className={`h-56 animate-pulse rounded-2xl border ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white'}`} key={item} />
          ))}
        </div>
      </section>
    );
  }

  if (status === 'error' || !series) {
    return (
      <section className={`rounded-2xl border px-5 py-8 text-center text-sm font-bold ${
        darkMode ? 'border-white/10 bg-white/[0.04] text-stone-300' : 'border-black/10 bg-white text-zinc-700 shadow-sm shadow-zinc-900/5'
      }`}>
        We could not load this series right now.
      </section>
    );
  }

  const visibleItems = items ?? series.items;
  const totalItems = itemCount ?? visibleItems.length;

  return (
    <section className="grid gap-10">
      <div className={`rounded-3xl border p-6 shadow-xl sm:p-8 ${
        darkMode
          ? 'border-white/10 bg-[linear-gradient(135deg,rgba(153,27,27,0.16),rgba(255,255,255,0.035))] shadow-black/25'
          : 'border-black/10 bg-white shadow-zinc-900/10'
      }`}>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700 dark:text-red-200">Media Series</p>
        <h1 className={`mt-3 max-w-4xl font-serif text-4xl font-bold leading-tight tracking-normal sm:text-5xl ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{series.name}</h1>
        {series.description && (
          <p className={`mt-4 max-w-3xl text-base leading-7 sm:text-lg sm:leading-8 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>{series.description}</p>
        )}
        <p className={`mt-5 text-sm font-bold ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>
          {totalItems} {totalItems === 1 ? 'message' : 'messages'} in this series
        </p>
      </div>

      <MediaRail
        canLoadMore={canLoadMore}
        darkMode={darkMode}
        items={visibleItems}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
        relatedContext={{ label: series.name, series: series.slug }}
        title={`${series.name} Messages`}
      />
      {loadMoreError ? (
        <p className="rounded-2xl border border-red-900/15 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100" role="status">
          {loadMoreError}
        </p>
      ) : null}
    </section>
  );
};

export default MediaSeriesDetail;
