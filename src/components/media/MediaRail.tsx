import type { AudioVisualItem } from '../../types/audioVisual';
import MediaCard from './MediaCard';

type MediaRailProps = {
  darkMode: boolean;
  items: AudioVisualItem[];
  title: string;
  variant?: 'landscape' | 'portrait' | 'compact';
};

const MediaRail = ({ darkMode, items, title, variant = 'landscape' }: MediaRailProps) => {
  if (items.length === 0) return null;

  const gridClass =
    variant === 'portrait'
      ? 'grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]'
      : 'grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]';

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className={`text-sm font-black uppercase tracking-[0.16em] ${darkMode ? 'text-white' : 'text-zinc-950'}`}>{title}</h2>
        <a href="#media-rail" className={`text-sm font-black ${darkMode ? 'text-red-200 hover:text-white' : 'text-red-800 hover:text-zinc-950'}`}>View all</a>
      </div>
      <div className={`grid gap-4 ${gridClass}`}>
        {items.map((item) => (
          <MediaCard key={`${title}-${item.slug}`} darkMode={darkMode} item={item} variant={variant} />
        ))}
      </div>
    </section>
  );
};

export default MediaRail;
