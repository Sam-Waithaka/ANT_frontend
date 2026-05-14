import { ArrowDown, ArrowRight } from 'lucide-react';
import LandingButton from '../landing/LandingButton';
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
}: MediaRailProps) => {
  if (items.length === 0) return null;

  const visibleItems = onLoadMore ? items : items.slice(0, initialVisibleItems);
  const gridClass =
    variant === 'portrait'
      ? 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5'
      : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <section>
      <div className="mb-5 flex items-center gap-4">
        <div className={`h-px flex-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
        <h2 className={`shrink-0 text-center text-sm font-black uppercase tracking-[0.16em] ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{title}</h2>
        <div className={`h-px flex-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
      </div>
      <div className={gridClass}>
        {visibleItems.map((item) => (
          <div key={`${title}-${item.slug}`} className="min-w-0">
            <MediaCard darkMode={darkMode} item={item} variant={variant} />
          </div>
        ))}
      </div>
      {onViewMore && (
        <div className="mt-6 flex justify-center">
          <LandingButton darkMode={darkMode} icon={ArrowRight} iconPosition="after" variant="secondary" onClick={onViewMore}>
            View more
          </LandingButton>
        </div>
      )}
      {onLoadMore && canLoadMore && (
        <div className="mt-6 flex justify-center">
          <LandingButton darkMode={darkMode} icon={ArrowDown} variant="secondary" onClick={loadingMore ? undefined : onLoadMore}>
            {loadingMore ? 'Loading more...' : 'Load more'}
          </LandingButton>
        </div>
      )}
    </section>
  );
};

export default MediaRail;
