import { useState } from 'react';
import type { AudioVisualItem } from '../../types/audioVisual';
import MediaCard from './MediaCard';

type MediaRailProps = {
  darkMode: boolean;
  initialVisibleItems?: number;
  items: AudioVisualItem[];
  title: string;
  variant?: 'landscape' | 'portrait' | 'compact';
};

const INITIAL_VISIBLE_ITEMS = 10;

const MediaRail = ({ darkMode, initialVisibleItems = INITIAL_VISIBLE_ITEMS, items, title, variant = 'landscape' }: MediaRailProps) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const canExpand = items.length > initialVisibleItems;
  const visibleItems = expanded ? items : items.slice(0, initialVisibleItems);
  const gridClass =
    variant === 'portrait'
      ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5';

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className={`text-sm font-black uppercase tracking-[0.16em] ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{title}</h2>
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className={`text-sm font-black ${darkMode ? 'text-red-200 hover:text-white' : 'text-red-800 hover:text-zinc-950'}`}
          >
            {expanded ? 'Show less' : 'View more'}
          </button>
        )}
      </div>
      <div className={`grid gap-4 ${gridClass}`}>
        {visibleItems.map((item) => (
          <MediaCard key={`${title}-${item.slug}`} darkMode={darkMode} item={item} variant={variant} />
        ))}
      </div>
    </section>
  );
};

export default MediaRail;
