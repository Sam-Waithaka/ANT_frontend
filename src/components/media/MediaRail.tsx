import { useState } from 'react';
import type { AudioVisualItem } from '../../types/audioVisual';
import MediaCard from './MediaCard';

type MediaRailProps = {
  canLoadMore?: boolean;
  darkMode: boolean;
  initialVisibleItems?: number;
  items: AudioVisualItem[];
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onViewMore?: () => void;
  title: string;
  variant?: 'landscape' | 'portrait' | 'compact';
  viewMoreLabel?: string;
};

const INITIAL_VISIBLE_ITEMS = 10;

const MediaRail = ({
  canLoadMore = false,
  darkMode,
  initialVisibleItems = INITIAL_VISIBLE_ITEMS,
  items,
  loadingMore = false,
  onLoadMore,
  onViewMore,
  title,
  variant = 'landscape',
  viewMoreLabel = 'View more',
}: MediaRailProps) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const canExpand = !onViewMore && items.length > initialVisibleItems;
  const visibleItems = expanded || onLoadMore ? items : items.slice(0, initialVisibleItems);
  const gridClass =
    variant === 'portrait'
      ? 'columns-2 gap-4 md:columns-3 xl:columns-5'
      : 'columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-5';

  return (
    <section>
      <div className="mb-5 flex items-center gap-4">
        <div className={`h-px flex-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
        <h2 className={`shrink-0 text-center text-sm font-black uppercase tracking-[0.16em] ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{title}</h2>
        <div className={`h-px flex-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
      </div>
      <div className={gridClass}>
        {visibleItems.map((item) => (
          <div key={`${title}-${item.slug}`} className="mb-4 break-inside-avoid">
            <MediaCard darkMode={darkMode} item={item} variant={variant} />
          </div>
        ))}
      </div>
      {(onViewMore || canExpand) && (
        <div className="mt-6 flex justify-center">
          {onViewMore ? (
            <button
              type="button"
              onClick={onViewMore}
              className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-black shadow-lg transition hover:-translate-y-0.5 ${
                darkMode
                  ? 'border-white/10 bg-white/10 text-white shadow-black/25 hover:bg-white/15'
                  : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/10 hover:bg-[#fffaf0]'
              }`}
            >
              {viewMoreLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-black shadow-lg transition hover:-translate-y-0.5 ${
                darkMode
                  ? 'border-white/10 bg-white/10 text-white shadow-black/25 hover:bg-white/15'
                  : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/10 hover:bg-[#fffaf0]'
              }`}
            >
              {expanded ? 'Show less' : 'View more'}
            </button>
          )}
        </div>
      )}
      {onLoadMore && canLoadMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={onLoadMore}
            className={`inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-65 ${
              darkMode
                ? 'border-white/10 bg-white/10 text-white shadow-black/25 hover:bg-white/15'
                : 'border-black/10 bg-white text-zinc-950 shadow-zinc-900/10 hover:bg-[#fffaf0]'
            }`}
          >
            {loadingMore ? 'Loading more...' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  );
};

export default MediaRail;
