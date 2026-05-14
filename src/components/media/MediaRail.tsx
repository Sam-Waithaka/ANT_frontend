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
      ? 'columns-2 gap-4 md:columns-3 xl:columns-5'
      : 'columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-5';

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
      <div className={gridClass}>
        {visibleItems.map((item) => (
          <div key={`${title}-${item.slug}`} className="mb-4 break-inside-avoid">
            <MediaCard darkMode={darkMode} item={item} variant={variant} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MediaRail;
