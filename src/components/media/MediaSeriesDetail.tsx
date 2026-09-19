import { Video } from 'lucide-react';
import type { AudioVisualGroupDetail, AudioVisualItem } from '../../types/audioVisual';
import MediaCard from './MediaCard';
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

const getSeriesMessageLabel = (_item: AudioVisualItem, index: number) => `Message ${index + 1}`;

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
        <div className={`grid gap-8 rounded-3xl border p-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1.2fr)] lg:items-center lg:p-8 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white'}`}>
          <div className={`h-48 animate-pulse rounded-2xl ${darkMode ? 'bg-white/[0.05]' : 'bg-black/[0.04]'}`} />
          <div className={`aspect-video animate-pulse rounded-2xl ${darkMode ? 'bg-white/[0.05]' : 'bg-black/[0.04]'}`} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2].map((item) => (
            <div className={`h-48 animate-pulse rounded-3xl border ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white'}`} key={item} />
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
  const featuredItem = visibleItems[0];
  const countLabel = `${totalItems} ${totalItems === 1 ? 'message' : 'messages'}`;
  const relatedContext = { label: series.name, series: series.slug };

  return (
    <section className="grid min-w-0 gap-10 lg:gap-12">
      <div className={`grid min-w-0 gap-8 rounded-3xl border p-5 shadow-xl sm:p-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1.2fr)] lg:items-center lg:gap-10 lg:p-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(28rem,1.28fr)] ${
        darkMode
          ? 'border-white/10 bg-[linear-gradient(135deg,rgba(153,27,27,0.16),rgba(255,255,255,0.035))] shadow-black/25'
          : 'border-black/10 bg-white shadow-zinc-900/10'
      }`}>
        <div className="min-w-0 lg:py-4">
          <p className={`text-xs font-black uppercase tracking-[0.18em] ${darkMode ? 'text-red-200' : 'text-red-800'}`}>Media series</p>
          <h1 className={`mt-3 max-w-2xl break-words text-4xl font-black leading-[1.02] sm:text-5xl xl:text-6xl ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{series.name}</h1>
          {series.description && (
            <p className={`mt-4 max-w-2xl break-words text-base leading-7 sm:text-lg sm:leading-8 ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>{series.description}</p>
          )}
          <p className={`mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold ${darkMode ? 'text-stone-300' : 'text-zinc-600'}`}>
            <Video size={18} aria-hidden="true" />
            {countLabel}
          </p>
        </div>

        {featuredItem ? (
          <div className="w-full min-w-0 max-w-3xl justify-self-end">
            <MediaCard
              darkMode={darkMode}
              item={featuredItem}
              messageLabel="Message 1"
              relatedContext={relatedContext}
            />
          </div>
        ) : null}
      </div>

      <section className="min-w-0" aria-labelledby="series-messages-heading">
        <div className={`mb-5 flex min-w-0 flex-wrap items-center gap-3 border-b pb-4 pr-[calc(var(--mobile-give-action-width)+var(--mobile-bottom-action-gap))] md:pr-0 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          <h2 id="series-messages-heading" className={`min-w-0 break-words text-2xl font-black sm:text-3xl ${darkMode ? 'text-white' : 'text-zinc-950'}`}>
            Messages in this series
          </h2>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${darkMode ? 'bg-red-950/60 text-red-100' : 'bg-red-50 text-red-800'}`}>
            {countLabel}
          </span>
        </div>

        {visibleItems.length > 0 ? (
          <MediaRail
            canLoadMore={canLoadMore}
            darkMode={darkMode}
            getItemMessageLabel={getSeriesMessageLabel}
            items={visibleItems}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
            relatedContext={relatedContext}
            showHeader={false}
            title={`${series.name} messages`}
          />
        ) : (
          <div className={`rounded-3xl border px-5 py-10 text-center ${darkMode ? 'border-white/10 bg-zinc-950 text-stone-300' : 'border-black/10 bg-white text-zinc-700 shadow-sm shadow-zinc-900/5'}`}>
            <p className="font-bold">There are no messages in this series yet.</p>
            <p className={`mt-2 text-sm ${darkMode ? 'text-stone-400' : 'text-zinc-600'}`}>Please check back later.</p>
          </div>
        )}

        {loadMoreError ? (
          <p className="mt-4 rounded-2xl border border-red-900/15 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-800 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100" role="status">
            {loadMoreError}
          </p>
        ) : null}
      </section>
    </section>
  );
};

export default MediaSeriesDetail;
